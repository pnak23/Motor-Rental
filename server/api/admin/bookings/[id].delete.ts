import { query } from '../../../utils/db'
import { requireShopAdmin } from '../../../utils/auth'
import { logAudit } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
  const user = await requireShopAdmin(event, ['SUPER_ADMIN', 'ADMIN'])
  const id = getRouterParam(event, 'id')

  const rows = await query(`DELETE FROM bookings WHERE id = $1 AND "shopId" = $2 RETURNING "bookingNumber"`, [id, user.shopId])
  if (rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Booking not found' })
  }

  await logAudit(event, user.id, 'DELETE_BOOKING', 'Booking', id, `Deleted booking ${rows[0].bookingNumber}`, user.shopId)

  return { success: true, data: null }
})
