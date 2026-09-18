import { queryOne, query } from '../../../utils/db'
import { requireShopAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireShopAdmin(event)
  const id = getRouterParam(event, 'id')

  const customer = await queryOne(
    `SELECT c.* FROM customers c
     WHERE c.id = $1 AND EXISTS (SELECT 1 FROM bookings b WHERE b."customerId" = c.id AND b."shopId" = $2)`,
    [id, user.shopId]
  )
  if (!customer) {
    throw createError({ statusCode: 404, statusMessage: 'Customer not found' })
  }

  const bookings = await query(
    `SELECT b.*, m.name as "motorbikeName" FROM bookings b
     JOIN motorbikes m ON m.id = b."motorbikeId"
     WHERE b."customerId" = $1 AND b."shopId" = $2 ORDER BY b."createdAt" DESC`,
    [id, user.shopId]
  )

  return { success: true, data: { ...customer, bookings } }
})
