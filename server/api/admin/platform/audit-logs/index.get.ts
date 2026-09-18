import { query, queryOne } from '../../../../utils/db'
import { requirePlatformAdmin } from '../../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event)
  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const pageSize = Math.min(200, Math.max(1, Number(q.pageSize) || 50))
  const shopId = (q.shopId as string) || ''

  const totalRow = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text as count FROM audit_logs a ${shopId ? 'WHERE a."shopId" = $1' : ''}`,
    shopId ? [shopId] : []
  )
  const total = Number(totalRow?.count || 0)

  const rows = await query(
    `SELECT a.*, u.email as "userEmail", u.name as "userName", s.name as "shopName" FROM audit_logs a
     LEFT JOIN users u ON u.id = a."userId"
     LEFT JOIN shops s ON s.id = a."shopId"
     ${shopId ? 'WHERE a."shopId" = $3' : ''}
     ORDER BY a."createdAt" DESC
     LIMIT $1 OFFSET $2`,
    shopId ? [pageSize, (page - 1) * pageSize, shopId] : [pageSize, (page - 1) * pageSize]
  )

  return { success: true, data: { items: rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } }
})
