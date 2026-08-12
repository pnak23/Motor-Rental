import { queryOne, query } from '../../../utils/db'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const id = getRouterParam(event, 'id')

  const customer = await queryOne(`SELECT * FROM customers WHERE id = $1`, [id])
  if (!customer) {
    throw createError({ statusCode: 404, statusMessage: 'Customer not found' })
  }

  const bookings = await query(
    `SELECT b.*, m.name as "motorbikeName" FROM bookings b
     JOIN motorbikes m ON m.id = b."motorbikeId"
     WHERE b."customerId" = $1 ORDER BY b."createdAt" DESC`,
    [id]
  )

  return { success: true, data: { ...customer, bookings } }
})
