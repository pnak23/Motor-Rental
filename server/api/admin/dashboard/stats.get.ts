import { requireShopAdmin } from '../../../utils/auth'
import { getShopStats } from '../../../utils/shopStats'

export default defineEventHandler(async (event) => {
  const admin = await requireShopAdmin(event)
  return { success: true, data: await getShopStats(admin.shopId) }
})
