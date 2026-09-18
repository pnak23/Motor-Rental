import { getAuthUser, IMPERSONATOR_COOKIE } from '../../utils/auth'
import { queryOne } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const user = await getAuthUser(event)
  if (!user) return { success: true, data: null }

  let shopName: string | null = null
  if (user.shopId) {
    const shop = await queryOne<{ name: string }>(`SELECT name FROM shops WHERE id = $1`, [user.shopId])
    shopName = shop?.name ?? null
  }

  const impersonating = !!getCookie(event, IMPERSONATOR_COOKIE)

  return { success: true, data: { ...user, shopName, impersonating } }
})
