import { z } from 'zod'
import { queryOne, query, withTransaction } from '../../../utils/db'
import { requireAuth } from '../../../utils/auth'
import { logAudit } from '../../../utils/audit'
import { getBookingConflict } from '../../../utils/availability'
import { paymentStatusEnum, paymentMethodEnum, REQUIRED_DEPOSIT_RATIO } from '../../../utils/schemas'

const bodySchema = z.object({
  motorbikeId: z.string().optional(),
  pickupDate: z.string().optional(),
  returnDate: z.string().optional(),
  pickupLocationId: z.string().optional().nullable(),
  returnLocationId: z.string().optional().nullable(),
  paymentStatus: paymentStatusEnum.optional(),
  paymentMethod: paymentMethodEnum.optional().nullable(),
  paymentReference: z.string().optional().nullable(),
  paidAmount: z.coerce.number().min(0).optional(),
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
    status: string
    subtotal: string
    discount: string
    deliveryFee: string
    additionalCharges: string
    deposit: string
    paymentStatus: string
    paidAmount: string
    paidAt: string | null
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
      const conflict = await getBookingConflict(client, motorbikeId, pickupDate, returnDate, id)
      if (conflict) {
        throw createError({
          statusCode: 409,
          statusMessage: `Motorbike is already reserved from ${conflict.pickupDate.toISOString()} to ${conflict.returnDate.toISOString()}`
        })
      }
    })
  }

  const discount = d.discount ?? Number(existing.discount)
  const additionalCharges = d.additionalCharges ?? Number(existing.additionalCharges)
  const deposit = d.deposit ?? Number(existing.deposit)
  const deliveryFee = Number(existing.deliveryFee)
  const subtotal = Number(existing.subtotal)
  const total = Math.max(0, subtotal - discount + deliveryFee + additionalCharges)
  const paymentStatus = d.paymentStatus ?? existing.paymentStatus
  const paidAmount = d.paidAmount ?? Number(existing.paidAmount)
  // Stamp the moment a booking first becomes fully paid; once set, leave it
  // alone (e.g. a later refund shouldn't erase when it was originally paid).
  const paidAt = existing.paidAt ?? (paymentStatus === 'PAID' ? new Date() : null)

  // Don't let a financial edit drop an already-confirmed/active booking
  // below the required 50% deposit.
  if (['CONFIRMED', 'PICKED_UP'].includes(existing.status)) {
    const requiredDeposit = Math.round(total * REQUIRED_DEPOSIT_RATIO * 100) / 100
    if (paidAmount < requiredDeposit - 0.01) {
      throw createError({
        statusCode: 409,
        statusMessage: `This booking is ${existing.status === 'PICKED_UP' ? 'picked up' : 'confirmed'} and requires at least $${requiredDeposit.toFixed(2)} (50% of the total) paid. Reduce the total or increase the paid amount first.`
      })
    }
  }

  const rows = await query(
    `UPDATE bookings SET
      "motorbikeId" = $1, "pickupDate" = $2, "returnDate" = $3,
      "pickupLocationId" = $4, "returnLocationId" = $5,
      discount = $6, "additionalCharges" = $7, deposit = $8, total = $9,
      "paymentStatus" = $10, "paidAmount" = $11, "paidAt" = $12,
      "paymentMethod" = COALESCE($13, "paymentMethod"), "paymentReference" = COALESCE($14, "paymentReference"),
      notes = COALESCE($15, notes), "updatedAt" = now()
     WHERE id = $16 RETURNING *`,
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
      paymentStatus,
      paidAmount,
      paidAt,
      d.paymentMethod ?? null,
      d.paymentReference ?? null,
      d.notes ?? null,
      id
    ]
  )

  await logAudit(event, user.id, 'UPDATE_BOOKING', 'Booking', id, 'Booking details edited')

  return { success: true, data: rows[0] }
})
