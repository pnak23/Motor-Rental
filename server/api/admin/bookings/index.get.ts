import { query, queryOne } from '../../../utils/db'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(q.pageSize) || 20))
  const status = (q.status as string) || ''
  const search = (q.search as string) || ''

  const where: string[] = []
  const params: unknown[] = []

  if (status) {
    params.push(status)
    where.push(`b.status = $${params.length}`)
  }
  if (search) {
    params.push(`%${search.toLowerCase()}%`)
    where.push(
      `(LOWER(c."fullName") LIKE $${params.length} OR LOWER(c.phone) LIKE $${params.length} OR LOWER(b."bookingNumber") LIKE $${params.length})`
    )
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

  const totalRow = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text as count FROM bookings b JOIN customers c ON c.id = b."customerId" ${whereSql}`,
    params
  )
  const total = Number(totalRow?.count || 0)

  params.push(pageSize)
  params.push((page - 1) * pageSize)

  const rows = await query(
    `SELECT b.*, c."fullName" as "customerName", c.phone as "customerPhone", m.name as "motorbikeName", m.slug as "motorbikeSlug"
     FROM bookings b
     JOIN customers c ON c.id = b."customerId"
     JOIN motorbikes m ON m.id = b."motorbikeId"
     ${whereSql}
     ORDER BY b."createdAt" DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  )

  return {
    success: true,
    data: { items: rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  }
})
