import { query } from '../../../utils/db'
import { requireAuth } from '../../../utils/auth'
import { logAudit } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event, ['SUPER_ADMIN', 'ADMIN'])
  const id = getRouterParam(event, 'id')

  const activeBookings = await query(
    `SELECT id FROM bookings WHERE "motorbikeId" = $1 AND status IN ('PENDING','CONFIRMED','PICKED_UP')`,
    [id]
  )
  if (activeBookings.length > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: 'This motorbike has active or upcoming bookings and cannot be deleted. Deactivate it instead.'
    })
  }

  const rows = await query(`DELETE FROM motorbikes WHERE id = $1 RETURNING name`, [id])
  if (rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Motorbike not found' })
  }

  await logAudit(event, user.id, 'DELETE_MOTORBIKE', 'Motorbike', id, `Deleted ${rows[0].name}`)

  return { success: true, data: null }
})
