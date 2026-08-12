import { query, queryOne } from '../../../utils/db'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event, ['SUPER_ADMIN', 'ADMIN'])
  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const pageSize = Math.min(200, Math.max(1, Number(q.pageSize) || 50))

  const totalRow = await queryOne<{ count: string }>(`SELECT COUNT(*)::text as count FROM audit_logs`)
  const total = Number(totalRow?.count || 0)

  const rows = await query(
    `SELECT a.*, u.email as "userEmail", u.name as "userName" FROM audit_logs a
     LEFT JOIN users u ON u.id = a."userId"
     ORDER BY a."createdAt" DESC
     LIMIT $1 OFFSET $2`,
    [pageSize, (page - 1) * pageSize]
  )

  return { success: true, data: { items: rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } }
})
