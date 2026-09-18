import { query, queryOne } from '../../../utils/db'
import { requireShopAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireShopAdmin(event, ['SUPER_ADMIN', 'ADMIN'])
  const id = getRouterParam(event, 'id')

  const rule = await queryOne(
    `SELECT r.id FROM pricing_rules r JOIN motorbikes m ON m.id = r."motorbikeId" WHERE r.id = $1 AND m."shopId" = $2`,
    [id, user.shopId]
  )
  if (!rule) {
    throw createError({ statusCode: 404, statusMessage: 'Pricing rule not found' })
  }

  if (event.method === 'DELETE') {
    await query(`DELETE FROM pricing_rules WHERE id = $1`, [id])
    return { success: true, data: null }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
