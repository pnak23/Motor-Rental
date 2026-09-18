import { z } from 'zod'
import { query } from '../../../../utils/db'
import { requireShopAdmin } from '../../../../utils/auth'
import { logAudit } from '../../../../utils/audit'
import { notifyPlatformAdmin } from '../../../../utils/wsHub'

const bodySchema = z.object({ note: z.string().optional() })

export default defineEventHandler(async (event) => {
  const admin = await requireShopAdmin(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  const parsed = bodySchema.safeParse(await readBody(event).catch(() => ({})))
  const note = parsed.success ? parsed.data.note ?? null : null

  const rows = await query(
    `UPDATE shop_access_requests
     SET status = 'DENIED', "respondedById" = $1, "respondedAt" = now(), "responseNote" = $2
     WHERE id = $3 AND "shopId" = $4 AND status = 'PENDING'
     RETURNING *`,
    [admin.id, note, id, admin.shopId]
  )
  if (rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Request not found or already resolved' })
  }

  await logAudit(event, admin.id, 'DENY_SHOP_ACCESS', 'ShopAccessRequest', id, note ? `Denied: ${note}` : 'Denied a shop access request', admin.shopId)
  notifyPlatformAdmin(rows[0].requestedById, { type: 'request:denied', request: rows[0] })

  return { success: true, data: rows[0] }
})
