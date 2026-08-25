import { z } from 'zod'
import { queryOne, query, newId, withTransaction } from '../../../../utils/db'
import { requireAuth } from '../../../../utils/auth'
import { logAudit } from '../../../../utils/audit'
import { bookingStatusEnum } from '../../../../utils/schemas'
import { requiredDeposit, meetsDepositRequirement, calculateLateFee } from '../../../../utils/pricing'
import { notifyBookingStatusChanged } from '../../../../utils/notify'

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

  const booking = await queryOne<{
    id: string
    motorbikeId: string
    status: string
    total: string
    paidAmount: string
    returnDate: string
  }>(`SELECT id, "motorbikeId", status, total, "paidAmount", "returnDate" FROM bookings WHERE id = $1`, [id])
  if (!booking) {
    throw createError({ statusCode: 404, statusMessage: 'Booking not found' })
  }

  // At least 50% must be paid before a booking can move into a confirmed /
  // active state — applies to every path that can change status.
  if (['CONFIRMED', 'PICKED_UP'].includes(status) && !meetsDepositRequirement(Number(booking.total), Number(booking.paidAmount))) {
    throw createError({
      statusCode: 409,
      statusMessage: `At least $${requiredDeposit(Number(booking.total)).toFixed(2)} (50% of the total) must be paid before this booking can be ${status === 'PICKED_UP' ? 'picked up' : 'confirmed'}. Currently paid: $${Number(booking.paidAmount).toFixed(2)}.`
    })
  }

  // Returning the bike: stamp when it actually came back and suggest a late
  // fee based on the configured hourly rate — both stay editable afterwards
  // from the booking detail page.
  let actualReturnAt: Date | null = null
  let lateFeeAmount: number | null = null
  if (status === 'RETURNED') {
    actualReturnAt = new Date()
    const settings = await queryOne<{ lateFeePerHour: string }>(`SELECT "lateFeePerHour" FROM business_settings WHERE id = 'main'`)
    lateFeeAmount = calculateLateFee(new Date(booking.returnDate), actualReturnAt, Number(settings?.lateFeePerHour || 0))
  }

  await withTransaction(async (client) => {
    if (status === 'RETURNED') {
      await client.query(
        `UPDATE bookings SET status = $1, "actualReturnAt" = $2, "lateFeeAmount" = $3, "updatedAt" = now() WHERE id = $4`,
        [status, actualReturnAt, lateFeeAmount, id]
      )
    } else {
      await client.query(`UPDATE bookings SET status = $1, "updatedAt" = now() WHERE id = $2`, [status, id])
    }
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

  const updated = await query<{
    id: string
    bookingNumber: string
    pickupDate: string
    returnDate: string
    total: string
    paidAmount: string
    status: string
    customerId: string
    motorbikeId: string
  }>(`SELECT * FROM bookings WHERE id = $1`, [id])
  const result = updated[0]

  const [customer, motorbike] = await Promise.all([
    queryOne<{ fullName: string; email: string | null }>(`SELECT "fullName", email FROM customers WHERE id = $1`, [result.customerId]),
    queryOne<{ name: string }>(`SELECT name FROM motorbikes WHERE id = $1`, [result.motorbikeId])
  ])
  await notifyBookingStatusChanged(customer?.email, {
    bookingNumber: result.bookingNumber,
    motorbikeName: motorbike?.name || 'motorbike',
    pickupDate: result.pickupDate,
    returnDate: result.returnDate,
    total: Number(result.total),
    paidAmount: Number(result.paidAmount),
    status: result.status,
    customerName: customer?.fullName || 'Customer'
  })

  return { success: true, data: result }
})
