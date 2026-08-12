import { z } from 'zod'
import { queryOne, query, newId, withTransaction } from '../../../../utils/db'
import { requireAuth } from '../../../../utils/auth'
import { logAudit } from '../../../../utils/audit'
import { bookingStatusEnum } from '../../../../utils/schemas'

const bodySchema = z.object({
  status: bookingStatusEnum,
  note: z.string().optional().nullable()
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event, ['SUPER_ADMIN', 'ADMIN', 'STAFF'])
  const id = getRouterParam(event, 'id')
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'A valid status is required' })
  }
  const { status, note } = parsed.data

  const booking = await queryOne<{ id: string; motorbikeId: string; status: string }>(
    `SELECT id, "motorbikeId", status FROM bookings WHERE id = $1`,
    [id]
  )
  if (!booking) {
    throw createError({ statusCode: 404, statusMessage: 'Booking not found' })
  }

  await withTransaction(async (client) => {
    await client.query(`UPDATE bookings SET status = $1, "updatedAt" = now() WHERE id = $2`, [status, id])
    await client.query(
      `INSERT INTO booking_status_history (id, "bookingId", status, note, "changedById", "createdAt")
       VALUES ($1,$2,$3,$4,$5, now())`,
      [newId(), id, status, note ?? null, user.id]
    )

    // Keep the motorbike's live status in sync with the active rental.
    if (status === 'PICKED_UP') {
      await client.query(`UPDATE motorbikes SET status = 'RENTED' WHERE id = $1`, [booking.motorbikeId])
    } else if (['RETURNED', 'CANCELLED', 'REJECTED'].includes(status)) {
      await client.query(
        `UPDATE motorbikes SET status = 'AVAILABLE' WHERE id = $1 AND status = 'RENTED'`,
        [booking.motorbikeId]
      )
    }
  })

  await logAudit(event, user.id, 'UPDATE_BOOKING_STATUS', 'Booking', id, `Status changed to ${status}`)

  const updated = await query(`SELECT * FROM bookings WHERE id = $1`, [id])
  return { success: true, data: updated[0] }
})
