import { queryOne } from '../../../utils/db'
import { requireShopAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireShopAdmin(event)
  const shop = await queryOne(`SELECT * FROM shops WHERE id = $1`, [user.shopId])
  if (!shop) {
    throw createError({ statusCode: 404, statusMessage: 'Shop not found' })
  }
  return { success: true, data: shop }
})
