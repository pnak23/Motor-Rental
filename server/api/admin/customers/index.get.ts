import { query, queryOne } from '../../../utils/db'
import { requireShopAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireShopAdmin(event)
  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(q.pageSize) || 20))
  const search = (q.search as string) || ''

  const where: string[] = []
  const params: unknown[] = []

  params.push(user.shopId)
  where.push(`EXISTS (SELECT 1 FROM bookings b WHERE b."customerId" = c.id AND b."shopId" = $${params.length})`)

  if (search) {
    params.push(`%${search.toLowerCase()}%`)
    where.push(`(LOWER(c."fullName") LIKE $${params.length} OR LOWER(c.phone) LIKE $${params.length} OR LOWER(COALESCE(c.email,'')) LIKE $${params.length})`)
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

  const totalRow = await queryOne<{ count: string }>(`SELECT COUNT(*)::text as count FROM customers c ${whereSql}`, params)
  const total = Number(totalRow?.count || 0)

  params.push(pageSize)
  params.push((page - 1) * pageSize)

  const rows = await query(
    `SELECT c.*,
       (SELECT COUNT(*) FROM bookings b WHERE b."customerId" = c.id AND b."shopId" = $1)::int as "totalBookings",
       (SELECT COALESCE(SUM(total),0) FROM bookings b WHERE b."customerId" = c.id AND b."shopId" = $1 AND b.status <> 'CANCELLED' AND b.status <> 'REJECTED') as "totalSpent"
     FROM customers c
     ${whereSql}
     ORDER BY c."createdAt" DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  )

  return { success: true, data: { items: rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } }
})
