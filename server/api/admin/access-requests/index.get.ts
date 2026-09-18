import { query } from '../../../utils/db'
import { requireShopAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const admin = await requireShopAdmin(event, ['ADMIN'])
  const q = getQuery(event)
  const status = (q.status as string) || ''

  const where = [`r."shopId" = $1`]
  const params: unknown[] = [admin.shopId]
  if (status) {
    params.push(status)
    where.push(`r.status = $${params.length}`)
  }

  const rows = await query(
    `SELECT r.*, u.name as "requestedByName", u.email as "requestedByEmail"
     FROM shop_access_requests r
     LEFT JOIN users u ON u.id = r."requestedById"
     WHERE ${where.join(' AND ')}
     ORDER BY r."requestedAt" DESC
     LIMIT 100`,
    params
  )

  return { success: true, data: rows }
})
