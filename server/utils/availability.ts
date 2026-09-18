import type { PoolClient, Pool } from 'pg'
import { withTransaction, newId, newBookingNumber } from './db'

/** Booking statuses that occupy a motorbike's calendar. */
export const ACTIVE_BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'PICKED_UP'] as const

export interface BookingConflict {
  pickupDate: Date
  returnDate: Date
}

/**
 * Finds an existing active (pending/confirmed/picked-up) booking that
 * overlaps the requested range for this motorbike, or null if the bike is
 * free. Two ranges overlap when existing.pickupDate < requested.returnDate
 * AND existing.returnDate > requested.pickupDate.
 */
export async function getBookingConflict(
  client: PoolClient | Pool,
  motorbikeId: string,
  pickupDate: Date,
  returnDate: Date,
  excludeBookingId?: string
): Promise<BookingConflict | null> {
  const params: unknown[] = [motorbikeId, pickupDate, returnDate]
  let sql = `
    SELECT "pickupDate", "returnDate" FROM bookings
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
  sql += ` ORDER BY "pickupDate" ASC LIMIT 1`
  const res = await client.query(sql, params)
  if (res.rowCount === 0) return null
  return { pickupDate: res.rows[0].pickupDate, returnDate: res.rows[0].returnDate }
}

export async function isMotorbikeAvailable(
  client: PoolClient | Pool,
  motorbikeId: string,
  pickupDate: Date,
  returnDate: Date,
  excludeBookingId?: string
): Promise<boolean> {
  const conflict = await getBookingConflict(client, motorbikeId, pickupDate, returnDate, excludeBookingId)
  return conflict === null
}

export interface CreateBookingInput {
  motorbikeId: string
  shopId: string
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
  /** Defaults to 'PENDING' (public booking form flow). */
  status?: string
  /** Defaults to 'Booking submitted by customer'. */
  historyNote?: string
  /** Defaults to 'UNPAID'. */
  paymentStatus?: string
  /** Defaults to 0. */
  paidAmount?: number
  paymentMethod?: string | null
  paymentReference?: string | null
  paymentProofUrl?: string | null
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

    const conflict = await getBookingConflict(client, input.motorbikeId, input.pickupDate, input.returnDate)
    if (conflict) {
      throw createError({
        statusCode: 409,
        statusMessage: `Motorbike is already reserved from ${conflict.pickupDate.toISOString()} to ${conflict.returnDate.toISOString()}`
      })
    }

    const id = newId()
    const bookingNumber = newBookingNumber()
    const status = input.status ?? 'PENDING'
    const historyNote = input.historyNote ?? 'Booking submitted by customer'
    const paymentStatus = input.paymentStatus ?? 'UNPAID'
    const paidAmount = input.paidAmount ?? 0
    const paidAt = paymentStatus === 'PAID' ? new Date() : null

    const inserted = await client.query(
      `INSERT INTO bookings (
        id, "bookingNumber", "shopId", "motorbikeId", "customerId",
        "pickupDate", "returnDate", "pickupLocationId", "returnLocationId",
        subtotal, discount, "deliveryFee", "additionalCharges", deposit, total,
        status, "paymentStatus", "paymentMethod", "paymentReference", "paidAmount", "paidAt", "paymentProofUrl",
        notes, "createdAt", "updatedAt"
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,
        $23, now(), now()
      ) RETURNING *`,
      [
        id,
        bookingNumber,
        input.shopId,
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
        status,
        paymentStatus,
        input.paymentMethod ?? null,
        input.paymentReference ?? null,
        paidAmount,
        paidAt,
        input.paymentProofUrl ?? null,
        input.notes ?? null
      ]
    )

    await client.query(
      `INSERT INTO booking_status_history (id, "bookingId", status, note, "createdAt")
       VALUES ($1, $2, $3, $4, now())`,
      [newId(), id, status, historyNote]
    )

    return inserted.rows[0]
  })
}
