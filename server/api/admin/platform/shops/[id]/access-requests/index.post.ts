import { z } from 'zod'
import { query, queryOne, newId } from '../../../../../../utils/db'
import { requirePlatformAdmin } from '../../../../../../utils/auth'
import { logAudit } from '../../../../../../utils/audit'
import { notifyShopAdmins } from '../../../../../../utils/wsHub'

const bodySchema = z.object({ reason: z.string().min(3) })

export default defineEventHandler(async (event) => {
  const admin = await requirePlatformAdmin(event)
  const shopId = getRouterParam(event, 'id') as string

  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message || 'A reason is required' })
  }

  const existing = await queryOne(
    `SELECT * FROM shop_access_requests
     WHERE "shopId" = $1 AND "requestedById" = $2
       AND (status = 'PENDING' OR (status = 'APPROVED' AND "usedAt" IS NULL AND "expiresAt" > now()))
     ORDER BY "requestedAt" DESC LIMIT 1`,
    [shopId, admin.id]
  )
  if (existing) {
    return { success: true, data: existing }
  }

  const target = await queryOne<{ id: string }>(
    `SELECT id FROM users WHERE "shopId" = $1 AND "isActive" = true ORDER BY (role = 'ADMIN') DESC, "createdAt" ASC LIMIT 1`,
    [shopId]
  )
  if (!target) {
    throw createError({ statusCode: 404, statusMessage: 'This shop has no active user to request access to' })
  }

  const id = newId()
  const rows = await query(
    `INSERT INTO shop_access_requests (id, "shopId", "requestedById", "targetUserId", reason, status, "requestedAt", "expiresAt")
     VALUES ($1,$2,$3,$4,$5,'PENDING', now(), now() + interval '24 hours')
     RETURNING *`,
    [id, shopId, admin.id, target.id, parsed.data.reason]
  )

  await logAudit(event, admin.id, 'REQUEST_SHOP_ACCESS', 'Shop', shopId, `Requested access: ${parsed.data.reason}`, shopId)
  notifyShopAdmins(shopId, { type: 'request:new', request: rows[0] })

  return { success: true, data: rows[0] }
})
