import { queryOne, query } from '../../../utils/db'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const id = getRouterParam(event, 'id')

  const booking = await queryOne(
    `SELECT b.*,
       row_to_json(c.*) as customer,
       row_to_json(m.*) as motorbike,
       pl.name as "pickupLocationName",
       rl.name as "returnLocationName"
     FROM bookings b
     JOIN customers c ON c.id = b."customerId"
     JOIN motorbikes m ON m.id = b."motorbikeId"
     LEFT JOIN locations pl ON pl.id = b."pickupLocationId"
     LEFT JOIN locations rl ON rl.id = b."returnLocationId"
     WHERE b.id = $1`,
    [id]
  )
  if (!booking) {
    throw createError({ statusCode: 404, statusMessage: 'Booking not found' })
  }

  const timeline = await query(
    `SELECT h.*, u.name as "changedByName" FROM booking_status_history h
     LEFT JOIN users u ON u.id = h."changedById"
     WHERE h."bookingId" = $1 ORDER BY h."createdAt" ASC`,
    [id]
  )

  return { success: true, data: { ...booking, timeline } }
})
