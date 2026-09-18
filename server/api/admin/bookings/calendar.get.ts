import { z } from 'zod'
import { query } from '../../../utils/db'
import { requireShopAdmin } from '../../../utils/auth'

const querySchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1)
})

interface DayRow {
  date: string
  total: string
  pending: string
  confirmed: string
  active: string
  returned: string
  cancelled: string
  returning: string
}

export default defineEventHandler(async (event) => {
  const user = await requireShopAdmin(event)
  const parsed = querySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'from and to dates are required' })
  }
  const { from, to } = parsed.data

  if (new Date(to) < new Date(from)) {
    throw createError({ statusCode: 400, statusMessage: 'to must be on or after from' })
  }

  // generate_series enumerates every day in range and LEFT JOINs any booking
  // that overlaps it, so a multi-day reservation counts on every day it
  // actually occupies — not just its pickup date.
  const rows = await query<DayRow>(
    `SELECT
      to_char(d, 'YYYY-MM-DD') as date,
      COUNT(b.id) FILTER (WHERE b.status NOT IN ('CANCELLED','REJECTED'))::text as total,
      COUNT(b.id) FILTER (WHERE b.status = 'PENDING')::text as pending,
      COUNT(b.id) FILTER (WHERE b.status = 'CONFIRMED')::text as confirmed,
      COUNT(b.id) FILTER (WHERE b.status = 'PICKED_UP')::text as active,
      COUNT(b.id) FILTER (WHERE b.status = 'RETURNED')::text as returned,
      COUNT(b.id) FILTER (WHERE b.status = 'CANCELLED' OR b.status = 'REJECTED')::text as cancelled,
      COUNT(b.id) FILTER (WHERE b."returnDate"::date = d::date AND b.status NOT IN ('CANCELLED','REJECTED'))::text as returning
     FROM generate_series($1::date, $2::date, interval '1 day') d
     LEFT JOIN bookings b ON b."pickupDate" < (d + interval '1 day') AND b."returnDate" > d AND b."shopId" = $3
     GROUP BY d
     ORDER BY d`,
    [from, to, user.shopId]
  )

  return {
    success: true,
    data: rows.map((r) => ({
      date: r.date,
      total: Number(r.total),
      pending: Number(r.pending),
      confirmed: Number(r.confirmed),
      active: Number(r.active),
      returned: Number(r.returned),
      cancelled: Number(r.cancelled),
      returning: Number(r.returning)
    }))
  }
})
