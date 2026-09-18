import { requireAuth, verifyAuthToken, AUTH_COOKIE, IMPERSONATOR_COOKIE } from '../../../utils/auth'
import { logAudit } from '../../../utils/audit'
import { queryOne } from '../../../utils/db'
import { notifyShopAdmins } from '../../../utils/wsHub'

export default defineEventHandler(async (event) => {
  const impersonatedUser = await requireAuth(event)
  const impersonatorToken = getCookie(event, IMPERSONATOR_COOKIE)
  const payload = impersonatorToken ? verifyAuthToken(impersonatorToken) : null
  if (!impersonatorToken || !payload) {
    throw createError({ statusCode: 400, statusMessage: 'No impersonation session to exit' })
  }

  setCookie(event, AUTH_COOKIE, impersonatorToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  })
  deleteCookie(event, IMPERSONATOR_COOKIE, { path: '/' })

  await logAudit(event, payload.sub, 'EXIT_IMPERSONATION', 'User', impersonatedUser.id, `Exited impersonation of ${impersonatedUser.email}`)

  if (impersonatedUser.shopId) {
    const admin = await queryOne<{ id: string; name: string; email: string }>(`SELECT id, name, email FROM users WHERE id = $1`, [
      payload.sub
    ])
    notifyShopAdmins(impersonatedUser.shopId, {
      type: 'access:exited',
      admin: admin ? { id: admin.id, name: admin.name, email: admin.email } : null,
      at: new Date().toISOString()
    })
  }

  return { success: true, data: null }
})
