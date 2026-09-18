import { query, queryOne } from '../../../../../utils/db'
import { requirePlatformAdmin, signAuthToken, AUTH_COOKIE, IMPERSONATOR_COOKIE } from '../../../../../utils/auth'
import { logAudit } from '../../../../../utils/audit'
import { notifyShopAdmins } from '../../../../../utils/wsHub'

export default defineEventHandler(async (event) => {
  const admin = await requirePlatformAdmin(event)
  const shopId = getRouterParam(event, 'id') as string

  const approved = await queryOne<{ id: string }>(
    `SELECT id FROM shop_access_requests
     WHERE "shopId" = $1 AND "requestedById" = $2 AND status = 'APPROVED' AND "usedAt" IS NULL AND "expiresAt" > now()
     ORDER BY "respondedAt" DESC LIMIT 1`,
    [shopId, admin.id]
  )
  if (!approved) {
    throw createError({
      statusCode: 403,
      statusMessage: "This shop's Admin has not approved an access request yet — request access first"
    })
  }

  const owner = await queryOne<{ id: string; email: string; name: string }>(
    `SELECT id, email, name FROM users WHERE "shopId" = $1 AND "isActive" = true ORDER BY (role = 'ADMIN') DESC, "createdAt" ASC LIMIT 1`,
    [shopId]
  )
  if (!owner) {
    throw createError({ statusCode: 404, statusMessage: 'This shop has no active user to access it as' })
  }

  await query(`UPDATE shop_access_requests SET status = 'USED', "usedAt" = now() WHERE id = $1`, [approved.id])

  const currentToken = getCookie(event, AUTH_COOKIE)
  if (currentToken) {
    setCookie(event, IMPERSONATOR_COOKIE, currentToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    })
  }

  const token = signAuthToken(owner.id, '1d')
  setCookie(event, AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  })

  await logAudit(
    event,
    admin.id,
    'IMPERSONATE_SHOP',
    'Shop',
    shopId,
    `Accessed shop dashboard as ${owner.email} (approved request ${approved.id})`,
    shopId
  )
  notifyShopAdmins(shopId, {
    type: 'access:entered',
    admin: { id: admin.id, name: admin.name, email: admin.email },
    at: new Date().toISOString()
  })

  return { success: true, data: { id: owner.id, email: owner.email, name: owner.name } }
})
