import { z } from 'zod'
import { query } from '../../../utils/db'
import { requireAuth } from '../../../utils/auth'

const querySchema = z.object({
  date: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const parsed = querySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'date is required' })
  }
  const { date } = parsed.data

  // Overlap, not equality: a booking belongs to this day if the day falls
  // anywhere between its pickup and return, matching the calendar endpoint.
  const rows = await query(
    `SELECT b.*,
       c."fullName" as "customerName", c.phone as "customerPhone",
       m.name as "motorbikeName", m."plateNumber" as "motorbikePlate",
       (SELECT url FROM motorbike_images WHERE "motorbikeId" = m.id ORDER BY "isPrimary" DESC, "sortOrder" ASC LIMIT 1) as "motorbikeImage"
     FROM bookings b
     JOIN customers c ON c.id = b."customerId"
     JOIN motorbikes m ON m.id = b."motorbikeId"
     WHERE b."pickupDate" < ($1::date + interval '1 day') AND b."returnDate" > $1::date
     ORDER BY b."pickupDate" ASC`,
    [date]
  )

  return {
    success: true,
    data: rows.map((b: Record<string, unknown>) => ({
      ...b,
      remainingAmount: Math.max(0, Number(b.total) - Number(b.paidAmount))
    }))
  }
})
