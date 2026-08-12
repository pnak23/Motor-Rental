import { z } from 'zod'
import { queryOne, query, withTransaction } from '../../../utils/db'
import { requireAuth } from '../../../utils/auth'
import { logAudit } from '../../../utils/audit'
import { isMotorbikeAvailable } from '../../../utils/availability'

const bodySchema = z.object({
  motorbikeId: z.string().optional(),
  pickupDate: z.string().optional(),
  returnDate: z.string().optional(),
  pickupLocationId: z.string().optional().nullable(),
  returnLocationId: z.string().optional().nullable(),
  discount: z.coerce.number().min(0).optional(),
  additionalCharges: z.coerce.number().min(0).optional(),
  deposit: z.coerce.number().min(0).optional(),
  notes: z.string().optional().nullable()
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event, ['SUPER_ADMIN', 'ADMIN', 'STAFF'])
  const id = getRouterParam(event, 'id')
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid booking update' })
  }
  const d = parsed.data

  const existing = await queryOne<{
    motorbikeId: string
    pickupDate: string
    returnDate: string
    subtotal: string
    discount: string
    deliveryFee: string
    additionalCharges: string
    deposit: string
  }>(`SELECT * FROM bookings WHERE id = $1`, [id])
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Booking not found' })
  }

  const motorbikeId = d.motorbikeId || existing.motorbikeId
  const pickupDate = d.pickupDate ? new Date(d.pickupDate) : new Date(existing.pickupDate)
  const returnDate = d.returnDate ? new Date(d.returnDate) : new Date(existing.returnDate)

  if (d.motorbikeId || d.pickupDate || d.returnDate) {
    await withTransaction(async (client) => {
      await client.query(`SELECT id FROM motorbikes WHERE id = $1 FOR UPDATE`, [motorbikeId])
      const available = await isMotorbikeAvailable(client, motorbikeId, pickupDate, returnDate, id)
      if (!available) {
        throw createError({ statusCode: 409, statusMessage: 'Motorbike is not available for the selected dates' })
      }
    })
  }

  const discount = d.discount ?? Number(existing.discount)
  const additionalCharges = d.additionalCharges ?? Number(existing.additionalCharges)
  const deposit = d.deposit ?? Number(existing.deposit)
  const deliveryFee = Number(existing.deliveryFee)
  const subtotal = Number(existing.subtotal)
  const total = Math.max(0, subtotal - discount + deliveryFee + additionalCharges)

  const rows = await query(
    `UPDATE bookings SET
      "motorbikeId" = $1, "pickupDate" = $2, "returnDate" = $3,
      "pickupLocationId" = $4, "returnLocationId" = $5,
      discount = $6, "additionalCharges" = $7, deposit = $8, total = $9,
      notes = COALESCE($10, notes), "updatedAt" = now()
     WHERE id = $11 RETURNING *`,
    [
      motorbikeId,
      pickupDate,
      returnDate,
      d.pickupLocationId ?? null,
      d.returnLocationId ?? null,
      discount,
      additionalCharges,
      deposit,
      total,
      d.notes ?? null,
      id
    ]
  )

  await logAudit(event, user.id, 'UPDATE_BOOKING', 'Booking', id, 'Booking details edited')

  return { success: true, data: rows[0] }
})
