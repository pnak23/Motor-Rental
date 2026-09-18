import type { H3Event } from 'h3'
import { bookingCreateSchema } from '../../utils/schemas'
import { queryOne, query, newId } from '../../utils/db'
import { quotePrice, requiredDeposit, meetsDepositRequirement } from '../../utils/pricing'
import { createBookingSafely } from '../../utils/availability'
import { saveIdDocument, savePaymentProof } from '../../utils/upload'
import { notifyBookingCreated } from '../../utils/notify'
import { enforceRateLimit } from '../../utils/rateLimit'

/**
 * The public booking form submits multipart/form-data (not JSON) so it can
 * carry an optional photo of the customer's ID card / passport, and a
 * payment screenshot, alongside the rest of the booking fields.
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

  const body = {
    motorbikeId: fields.motorbikeId,
    pickupDate: fields.pickupDate,
    returnDate: fields.returnDate,
    pickupLocationId: fields.pickupLocationId || null,
    returnLocationId: fields.returnLocationId || null,
    paymentMethod: fields.paymentMethod,
    paymentReference: fields.paymentReference || null,
    paidAmount: fields.paidAmount,
    notes: fields.notes || null,
    customer: {
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
  // Limit booking-form spam/abuse: 10 submissions per IP per hour.
  enforceRateLimit(event, 'public-booking', { max: 10, windowMs: 60 * 60 * 1000 })

  const { body, idDocument, paymentProof } = await readBookingFormData(event)
  const parsed = bookingCreateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message || 'Please fill in all required booking details'
    })
  }
  const d = parsed.data
  const pickupDate = new Date(d.pickupDate)
  const returnDate = new Date(d.returnDate)
  if (Number.isNaN(pickupDate.getTime()) || Number.isNaN(returnDate.getTime()) || returnDate <= pickupDate) {
    throw createError({ statusCode: 400, statusMessage: 'Return date must be after the pickup date' })
  }

  const motorbike = await queryOne<{
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
    shopId: string
  }>(
    `SELECT id, name, "dailyPrice", "weeklyPrice", "monthlyPrice", deposit, "deliveryFee", "minRentalDays", "maxRentalDays", status, "shopId" FROM motorbikes WHERE id = $1`,
    [d.motorbikeId]
  )
  if (!motorbike) {
    throw createError({ statusCode: 404, statusMessage: 'Motorbike not found' })
  }
  if (motorbike.status === 'INACTIVE' || motorbike.status === 'MAINTENANCE') {
    throw createError({ statusCode: 409, statusMessage: 'This motorbike is not currently available for booking' })
  }

  const quote = await quotePrice(motorbike, pickupDate, returnDate)
  // Half-day rentals are an explicit shorter option and bypass the normal
  // min/max rental-day window.
  if (!quote.isHalfDay && (quote.days < motorbike.minRentalDays || quote.days > motorbike.maxRentalDays)) {
    throw createError({
      statusCode: 400,
      statusMessage: `This motorbike can be rented for between ${motorbike.minRentalDays} and ${motorbike.maxRentalDays} days (or a half-day)`
    })
  }

  const deliveryFee = Number(motorbike.deliveryFee) || 0
  const deposit = Number(motorbike.deposit) || 0
  const subtotal = quote.subtotal
  const total = Math.round((subtotal + deliveryFee) * 100) / 100

  // Customers must pay at least 50% of the total upfront. We can't verify
  // the payment programmatically (no live gateway), but we do enforce the
  // declared amount meets the threshold before the booking is created.
  if (!meetsDepositRequirement(total, d.paidAmount)) {
    throw createError({
      statusCode: 400,
      statusMessage: `A minimum deposit of $${requiredDeposit(total).toFixed(2)} (50% of the total) is required to submit this booking`
    })
  }
  const paymentStatus = d.paidAmount >= total - 0.01 ? 'PAID' : 'PARTIAL'

  // Only touch disk once we know the rest of the request is valid.
  const idDocumentUrl = idDocument ? (await saveIdDocument(idDocument.data, idDocument.type)).url : null
  const paymentProofUrl = paymentProof ? (await savePaymentProof(paymentProof.data, paymentProof.type)).url : null

  // Find or create the customer by phone number.
  let customer = await queryOne<{ id: string }>(`SELECT id FROM customers WHERE phone = $1`, [d.customer.phone])
  if (!customer) {
    const id = newId()
    const rows = await query(
      `INSERT INTO customers (id, "fullName", phone, email, nationality, "idType", "passportId", "idDocumentUrl", telegram, whatsapp, "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now(), now()) RETURNING id`,
      [
        id,
        d.customer.fullName,
        d.customer.phone,
        d.customer.email || null,
        d.customer.nationality || null,
        d.customer.idType || null,
        d.customer.passportId || null,
        idDocumentUrl,
        d.customer.telegram || null,
        d.customer.whatsapp || null
      ]
    )
    customer = rows[0]
  } else {
    await query(
      `UPDATE customers SET "fullName" = $1, email = COALESCE($2, email), nationality = COALESCE($3, nationality),
        "idType" = COALESCE($4, "idType"), "passportId" = COALESCE($5, "passportId"),
        "idDocumentUrl" = COALESCE($6, "idDocumentUrl"),
        telegram = COALESCE($7, telegram), whatsapp = COALESCE($8, whatsapp), "updatedAt" = now()
       WHERE id = $9`,
      [
        d.customer.fullName,
        d.customer.email || null,
        d.customer.nationality || null,
        d.customer.idType || null,
        d.customer.passportId || null,
        idDocumentUrl,
        d.customer.telegram || null,
        d.customer.whatsapp || null,
        customer.id
      ]
    )
  }

  const booking = await createBookingSafely({
    motorbikeId: motorbike.id,
    shopId: motorbike.shopId,
    customerId: customer.id,
    pickupDate,
    returnDate,
    pickupLocationId: d.pickupLocationId || null,
    returnLocationId: d.returnLocationId || null,
    subtotal,
    discount: 0,
    deliveryFee,
    additionalCharges: 0,
    deposit,
    total,
    notes: d.notes || null,
    paymentStatus,
    paymentMethod: d.paymentMethod,
    paymentReference: d.paymentReference || null,
    paidAmount: d.paidAmount,
    paymentProofUrl
  })

  await notifyBookingCreated(d.customer.email, motorbike.shopId, {
    bookingNumber: booking.bookingNumber,
    motorbikeName: motorbike.name,
    pickupDate: booking.pickupDate,
    returnDate: booking.returnDate,
    total: Number(booking.total),
    paidAmount: Number(booking.paidAmount),
    status: booking.status,
    customerName: d.customer.fullName
  })

  return {
    success: true,
    data: {
      bookingNumber: booking.bookingNumber,
      motorbikeName: motorbike.name,
      pickupDate: booking.pickupDate,
      returnDate: booking.returnDate,
      total: Number(booking.total),
      deposit: Number(booking.deposit),
      paidAmount: Number(booking.paidAmount),
      paymentStatus: booking.paymentStatus,
      customerName: d.customer.fullName
    }
  }
})
