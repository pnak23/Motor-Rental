import type { H3Event } from 'h3'
import { adminBookingCreateSchema } from '../../../utils/schemas'
import { queryOne, query, newId } from '../../../utils/db'
import { quotePrice, requiredDeposit, meetsDepositRequirement } from '../../../utils/pricing'
import { createBookingSafely } from '../../../utils/availability'
import { requireShopAdmin } from '../../../utils/auth'
import { logAudit } from '../../../utils/audit'
import { saveIdDocument, savePaymentProof } from '../../../utils/upload'
import { notifyBookingCreated } from '../../../utils/notify'

interface MotorbikeRow {
  id: string
  name: string
  dailyPrice: string
  weeklyPrice: string | null
  monthlyPrice: string | null
  deposit: string
  deliveryFee: string
  minRentalDays: number
  maxRentalDays: number
  status: string
}

/**
 * Like the public booking form, this is multipart/form-data (not JSON) so
 * a walk-in customer's ID card / passport photo can be attached alongside
 * the rest of the booking fields.
 */
async function readBookingFormData(event: H3Event) {
  const parts = await readMultipartFormData(event)
  if (!parts) {
    throw createError({ statusCode: 400, statusMessage: 'Please fill in all required booking details' })
  }

  const fields: Record<string, string> = {}
  let idDocument: { data: Buffer; type: string } | null = null
  let paymentProof: { data: Buffer; type: string } | null = null

  for (const part of parts) {
    if (!part.name) continue
    if (part.name === 'idDocument' || part.name === 'paymentProof') {
      if (part.filename && part.type && part.data.byteLength > 0) {
        const file = { data: part.data, type: part.type }
        if (part.name === 'idDocument') idDocument = file
        else paymentProof = file
      }
      continue
    }
    fields[part.name] = part.data.toString('utf-8')
  }

  const body: Record<string, unknown> = {
    motorbikeId: fields.motorbikeId,
    pickupDate: fields.pickupDate,
    returnDate: fields.returnDate,
    pickupLocationId: fields.pickupLocationId || null,
    returnLocationId: fields.returnLocationId || null,
    status: fields.status || undefined,
    paymentStatus: fields.paymentStatus || undefined,
    paymentMethod: fields.paymentMethod || undefined,
    paymentReference: fields.paymentReference || null,
    paidAmount: fields.paidAmount || undefined,
    discount: fields.discount || undefined,
    additionalCharges: fields.additionalCharges || undefined,
    deposit: fields.deposit || undefined,
    notes: fields.notes || null
  }

  if (fields.customerId) {
    body.customerId = fields.customerId
  } else {
    body.customer = {
      fullName: fields.customerFullName,
      phone: fields.customerPhone,
      email: fields.customerEmail || null,
      nationality: fields.customerNationality || null,
      idType: fields.customerIdType || null,
      passportId: fields.customerPassportId || null,
      telegram: fields.customerTelegram || null,
      whatsapp: fields.customerWhatsapp || null
    }
  }

  return { body, idDocument, paymentProof }
}

export default defineEventHandler(async (event) => {
  const user = await requireShopAdmin(event, ['SUPER_ADMIN', 'ADMIN', 'STAFF'])

  const { body, idDocument, paymentProof } = await readBookingFormData(event)
  const parsed = adminBookingCreateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message || 'Please fill in all required booking details' })
  }
  const d = parsed.data

  const pickupDate = new Date(d.pickupDate)
  const returnDate = new Date(d.returnDate)
  if (Number.isNaN(pickupDate.getTime()) || Number.isNaN(returnDate.getTime()) || returnDate <= pickupDate) {
    throw createError({ statusCode: 400, statusMessage: 'Return date must be after the pickup date' })
  }

  const motorbike = await queryOne<MotorbikeRow>(
    `SELECT id, name, "dailyPrice", "weeklyPrice", "monthlyPrice", deposit, "deliveryFee", "minRentalDays", "maxRentalDays", status, "shopId" FROM motorbikes WHERE id = $1 AND "shopId" = $2`,
    [d.motorbikeId, user.shopId]
  )
  if (!motorbike) {
    throw createError({ statusCode: 404, statusMessage: 'Motorbike not found' })
  }
  if (motorbike.status === 'INACTIVE' || motorbike.status === 'MAINTENANCE') {
    throw createError({ statusCode: 409, statusMessage: 'This motorbike is not currently available for booking' })
  }

  const quote = await quotePrice(motorbike, pickupDate, returnDate)
  if (!quote.isHalfDay && (quote.days < motorbike.minRentalDays || quote.days > motorbike.maxRentalDays)) {
    throw createError({
      statusCode: 400,
      statusMessage: `This motorbike can be rented for between ${motorbike.minRentalDays} and ${motorbike.maxRentalDays} days (or a half-day)`
    })
  }

  // Only touch disk once we know the rest of the request is valid.
  const idDocumentUrl = idDocument ? (await saveIdDocument(idDocument.data, idDocument.type)).url : null
  const paymentProofUrl = paymentProof ? (await savePaymentProof(paymentProof.data, paymentProof.type)).url : null

  // Resolve the customer: either an existing one picked from the admin's
  // search, or find-or-create by phone (same rule the public form uses).
  let customerId = d.customerId ?? null
  if (customerId) {
    const existing = await queryOne<{ id: string }>(`SELECT id FROM customers WHERE id = $1`, [customerId])
    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'Selected customer not found' })
    }
    if (idDocumentUrl) {
      await query(`UPDATE customers SET "idDocumentUrl" = $1, "updatedAt" = now() WHERE id = $2`, [idDocumentUrl, customerId])
    }
  } else if (d.customer) {
    const c = d.customer
    const found = await queryOne<{ id: string }>(`SELECT id FROM customers WHERE phone = $1`, [c.phone])
    if (found) {
      customerId = found.id
      await query(
        `UPDATE customers SET "fullName" = $1, email = COALESCE($2, email), nationality = COALESCE($3, nationality),
          "idType" = COALESCE($4, "idType"), "passportId" = COALESCE($5, "passportId"),
          "idDocumentUrl" = COALESCE($6, "idDocumentUrl"),
          telegram = COALESCE($7, telegram), whatsapp = COALESCE($8, whatsapp), "updatedAt" = now()
         WHERE id = $9`,
        [c.fullName, c.email || null, c.nationality || null, c.idType || null, c.passportId || null, idDocumentUrl, c.telegram || null, c.whatsapp || null, customerId]
      )
    } else {
      customerId = newId()
      await query(
        `INSERT INTO customers (id, "fullName", phone, email, nationality, "idType", "passportId", "idDocumentUrl", telegram, whatsapp, "createdAt", "updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now(), now())`,
        [customerId, c.fullName, c.phone, c.email || null, c.nationality || null, c.idType || null, c.passportId || null, idDocumentUrl, c.telegram || null, c.whatsapp || null]
      )
    }
  }
  if (!customerId) {
    throw createError({ statusCode: 400, statusMessage: 'Select an existing customer or enter new customer details' })
  }

  const deliveryFee = Number(motorbike.deliveryFee) || 0
  const discount = d.discount ?? 0
  const additionalCharges = d.additionalCharges ?? 0
  const deposit = d.deposit ?? (Number(motorbike.deposit) || 0)
  const subtotal = quote.subtotal
  const total = Math.max(0, Math.round((subtotal - discount + deliveryFee + additionalCharges) * 100) / 100)

  // Walk-in customers are physically present, so default to a confirmed
  // booking rather than the "pending review" state website submissions get.
  const status = d.status ?? 'CONFIRMED'
  const paidAmount = d.paidAmount ?? 0

  // At least 50% must be paid before a booking can be anything other than
  // Pending/Cancelled/Rejected — applies to staff-created bookings too.
  const requiresDeposit = !['PENDING', 'CANCELLED', 'REJECTED'].includes(status)
  if (requiresDeposit && !meetsDepositRequirement(total, paidAmount)) {
    throw createError({
      statusCode: 400,
      statusMessage: `At least $${requiredDeposit(total).toFixed(2)} (50% of the total) must be paid before this booking can be ${status.toLowerCase().replace('_', ' ')}`
    })
  }

  const booking = await createBookingSafely({
    shopId: user.shopId,
    motorbikeId: motorbike.id,
    customerId,
    pickupDate,
    returnDate,
    pickupLocationId: d.pickupLocationId || null,
    returnLocationId: d.returnLocationId || null,
    subtotal,
    discount,
    deliveryFee,
    additionalCharges,
    deposit,
    total,
    notes: d.notes || null,
    status,
    historyNote: `Booking created by ${user.name} for a walk-in customer`,
    paymentStatus: d.paymentStatus,
    paymentMethod: d.paymentMethod,
    paymentReference: d.paymentReference,
    paidAmount,
    paymentProofUrl
  })

  // Keep the motorbike's live status in sync if this booking is being
  // recorded as already picked up (e.g. backfilling an ongoing rental).
  if (booking.status === 'PICKED_UP') {
    await query(`UPDATE motorbikes SET status = 'RENTED' WHERE id = $1`, [motorbike.id])
  }

  await logAudit(event, user.id, 'CREATE_BOOKING', 'Booking', booking.id, `Created booking ${booking.bookingNumber}`, user.shopId)

  const customerRow = await queryOne<{ fullName: string; email: string | null }>(
    `SELECT "fullName", email FROM customers WHERE id = $1`,
    [customerId]
  )
  await notifyBookingCreated(customerRow?.email, user.shopId, {
    bookingNumber: booking.bookingNumber,
    motorbikeName: motorbike.name,
    pickupDate: booking.pickupDate,
    returnDate: booking.returnDate,
    total: Number(booking.total),
    paidAmount: Number(booking.paidAmount),
    status: booking.status,
    customerName: customerRow?.fullName || 'Customer'
  })

  return { success: true, data: booking }
})
