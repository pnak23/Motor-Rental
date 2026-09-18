import { query } from '../../../../utils/db'
import { requireShopAdmin } from '../../../../utils/auth'
import { logAudit } from '../../../../utils/audit'
import { notifyPlatformAdmin } from '../../../../utils/wsHub'

export default defineEventHandler(async (event) => {
  const admin = await requireShopAdmin(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')

  const rows = await query(
    `UPDATE shop_access_requests
     SET status = 'APPROVED', "respondedById" = $1, "respondedAt" = now(), "expiresAt" = now() + interval '1 hour'
     WHERE id = $2 AND "shopId" = $3 AND status = 'PENDING'
     RETURNING *`,
    [admin.id, id, admin.shopId]
  )
  if (rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Request not found or already resolved' })
  }

  await logAudit(event, admin.id, 'APPROVE_SHOP_ACCESS', 'ShopAccessRequest', id, 'Approved a shop access request', admin.shopId)
  notifyPlatformAdmin(rows[0].requestedById, { type: 'request:approved', request: rows[0] })

  return { success: true, data: rows[0] }
})
