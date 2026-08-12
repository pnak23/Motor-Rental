import type { PoolClient } from 'pg'
import { withTransaction, newId, newBookingNumber } from './db'

/** Booking statuses that occupy a motorbike's calendar. */
export const ACTIVE_BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'PICKED_UP'] as const

/**
 * Checks whether a motorbike is free for the given date range.
 * Two ranges overlap when existing.pickupDate < requested.returnDate
 * AND existing.returnDate > requested.pickupDate.
 */
export async function isMotorbikeAvailable(
  client: PoolClient,
  motorbikeId: string,
  pickupDate: Date,
  returnDate: Date,
  excludeBookingId?: string
): Promise<boolean> {
  const params: unknown[] = [motorbikeId, pickupDate, returnDate]
  let sql = `
    SELECT id FROM bookings
    WHERE "motorbikeId" = $1
      AND status = ANY($4::"BookingStatus"[])
      AND "pickupDate" < $3
      AND "returnDate" > $2
  `
  params.push(ACTIVE_BOOKING_STATUSES as unknown as string[])
  if (excludeBookingId) {
    sql += ` AND id <> $5`
    params.push(excludeBookingId)
  }
  const res = await client.query(sql, params)
  return res.rowCount === 0
}

export interface CreateBookingInput {
  motorbikeId: string
  customerId: string
  pickupDate: Date
  returnDate: Date
  pickupLocationId?: string | null
  returnLocationId?: string | null
  subtotal: number
  discount: number
  deliveryFee: number
  additionalCharges: number
  deposit: number
  total: number
  notes?: string | null
}

/**
 * Creates a booking with a row lock on the motorbike to guarantee two
 * simultaneous requests for overlapping dates cannot both succeed
 * (see section 36 of the spec: availability must be enforced server-side
 * even under concurrent submissions).
 */
export async function createBookingSafely(input: CreateBookingInput) {
  return withTransaction(async (client) => {
    // Lock the motorbike row so concurrent booking attempts serialize.
    await client.query(`SELECT id FROM motorbikes WHERE id = $1 FOR UPDATE`, [input.motorbikeId])

    const available = await isMotorbikeAvailable(
      client,
      input.motorbikeId,
      input.pickupDate,
      input.returnDate
    )
    if (!available) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Motorbike is not available for the selected dates'
      })
    }

    const id = newId()
    const bookingNumber = newBookingNumber()

    const inserted = await client.query(
      `INSERT INTO bookings (
        id, "bookingNumber", "motorbikeId", "customerId",
        "pickupDate", "returnDate", "pickupLocationId", "returnLocationId",
        subtotal, discount, "deliveryFee", "additionalCharges", deposit, total,
        status, "paymentStatus", "paidAmount", notes, "createdAt", "updatedAt"
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'PENDING','UNPAID',0,$15, now(), now()
      ) RETURNING *`,
      [
        id,
        bookingNumber,
        input.motorbikeId,
        input.customerId,
        input.pickupDate,
        input.returnDate,
        input.pickupLocationId ?? null,
        input.returnLocationId ?? null,
        input.subtotal,
        input.discount,
        input.deliveryFee,
        input.additionalCharges,
        input.deposit,
        input.total,
        input.notes ?? null
      ]
    )

    await client.query(
      `INSERT INTO booking_status_history (id, "bookingId", status, note, "createdAt")
       VALUES ($1, $2, 'PENDING', 'Booking submitted by customer', now())`,
      [newId(), id]
    )

    return inserted.rows[0]
  })
}
