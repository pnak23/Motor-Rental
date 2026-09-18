import { query, queryOne } from '../../../utils/db'
import { requireShopAdmin } from '../../../utils/auth'

const SORTABLE_COLUMNS: Record<string, string> = {
  pickupDate: 'b."pickupDate"',
  returnDate: 'b."returnDate"',
  total: 'b.total',
  createdAt: 'b."createdAt"',
  bookingNumber: 'b."bookingNumber"'
}

export default defineEventHandler(async (event) => {
  const user = await requireShopAdmin(event)
  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(q.pageSize) || 20))
  const status = (q.status as string) || ''
  const search = (q.search as string) || ''
  const motorbikeId = (q.motorbikeId as string) || ''
  const paymentStatus = (q.paymentStatus as string) || ''
  const from = (q.from as string) || ''
  const to = (q.to as string) || ''
  const sortBy = SORTABLE_COLUMNS[(q.sortBy as string) || ''] || 'b."createdAt"'
  const sortDir = (q.sortDir as string) === 'asc' ? 'ASC' : 'DESC'

  const where: string[] = []
  const params: unknown[] = []

  params.push(user.shopId)
  where.push(`b."shopId" = $${params.length}`)

  if (status) {
    params.push(status)
    where.push(`b.status = $${params.length}`)
  }
  if (paymentStatus) {
    params.push(paymentStatus)
    where.push(`b."paymentStatus" = $${params.length}`)
  }
  if (motorbikeId) {
    params.push(motorbikeId)
    where.push(`b."motorbikeId" = $${params.length}`)
  }
  if (from) {
    params.push(from)
    // Date-range filter matches by overlap, not just pickup date, so a
    // multi-day reservation shows up for every date range it touches.
    where.push(`b."returnDate" > $${params.length}::date`)
  }
  if (to) {
    params.push(to)
    where.push(`b."pickupDate" < ($${params.length}::date + interval '1 day')`)
  }
  if (search) {
    params.push(`%${search.toLowerCase()}%`)
    where.push(
      `(LOWER(c."fullName") LIKE $${params.length} OR LOWER(c.phone) LIKE $${params.length} OR LOWER(b."bookingNumber") LIKE $${params.length} OR LOWER(m.name) LIKE $${params.length})`
    )
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

  const totalRow = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text as count FROM bookings b
     JOIN customers c ON c.id = b."customerId"
     JOIN motorbikes m ON m.id = b."motorbikeId"
     ${whereSql}`,
    params
  )
  const total = Number(totalRow?.count || 0)

  params.push(pageSize)
  params.push((page - 1) * pageSize)

  const rows = await query(
    `SELECT b.*, c."fullName" as "customerName", c.phone as "customerPhone",
       m.name as "motorbikeName", m.slug as "motorbikeSlug", NULLIF(TRIM(CONCAT(m."plateProvince", ' ', m."plateNumber")), '') as "motorbikePlate",
       (SELECT url FROM motorbike_images WHERE "motorbikeId" = m.id ORDER BY "isPrimary" DESC, "sortOrder" ASC LIMIT 1) as "motorbikeImage"
     FROM bookings b
     JOIN customers c ON c.id = b."customerId"
     JOIN motorbikes m ON m.id = b."motorbikeId"
     ${whereSql}
     ORDER BY ${sortBy} ${sortDir}
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  )

  return {
    success: true,
    data: {
      items: rows.map((r: Record<string, unknown>) => ({
        ...r,
        remainingAmount: Math.max(0, Number(r.total) - Number(r.paidAmount))
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  }
})
