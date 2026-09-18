import { queryOne, query } from '../../../utils/db'
import { requireShopAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireShopAdmin(event)
  const id = getRouterParam(event, 'id')

  const motorbike = await queryOne(`SELECT * FROM motorbikes WHERE id = $1 AND "shopId" = $2`, [id, user.shopId])
  if (!motorbike) {
    throw createError({ statusCode: 404, statusMessage: 'Motorbike not found' })
  }
  const images = await query(
    `SELECT * FROM motorbike_images WHERE "motorbikeId" = $1 ORDER BY "isPrimary" DESC, "sortOrder" ASC`,
    [id]
  )
  const pricingRules = await query(
    `SELECT * FROM pricing_rules WHERE "motorbikeId" = $1 ORDER BY "minDays" ASC`,
    [id]
  )

  return { success: true, data: { ...motorbike, images, pricingRules } }
})
