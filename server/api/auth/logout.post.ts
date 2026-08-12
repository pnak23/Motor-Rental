import { AUTH_COOKIE, getAuthUser } from '../../utils/auth'
import { logAudit } from '../../utils/audit'

export default defineEventHandler(async (event) => {
  const user = await getAuthUser(event)
  if (user) {
    await logAudit(event, user.id, 'LOGOUT', 'User', user.id, `${user.email} logged out`)
  }
  deleteCookie(event, AUTH_COOKIE, { path: '/' })
  return { success: true, data: null }
})
