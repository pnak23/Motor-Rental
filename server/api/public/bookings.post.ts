import { bookingCreateSchema } from '../../utils/schemas'
import { queryOne, query, newId } from '../../utils/db'
import { quotePrice } from '../../utils/pricing'
import { createBookingSafely } from '../../utils/availability'

export default defineEventHandler(async (event) => {
  const parsed = bookingCreateSchema.safeParse(await readBody(event))
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
  }>(
    `SELECT id, name, "dailyPrice", "weeklyPrice", "monthlyPrice", deposit, "deliveryFee", "minRentalDays", "maxRentalDays", status FROM motorbikes WHERE id = $1`,
    [d.motorbikeId]
  )
  if (!motorbike) {
    throw createError({ statusCode: 404, statusMessage: 'Motorbike not found' })
  }
  if (motorbike.status === 'INACTIVE' || motorbike.status === 'MAINTENANCE') {
    throw createError({ statusCode: 409, statusMessage: 'This motorbike is not currently available for booking' })
  }

  const quote = await quotePrice(motorbike, pickupDate, returnDate)
  if (quote.days < motorbike.minRentalDays || quote.days > motorbike.maxRentalDays) {
    throw createError({
      statusCode: 400,
      statusMessage: `This motorbike can be rented for between ${motorbike.minRentalDays} and ${motorbike.maxRentalDays} days`
    })
  }

  const deliveryFee = Number(motorbike.deliveryFee) || 0
  const deposit = Number(motorbike.deposit) || 0
  const subtotal = quote.subtotal
  const total = Math.round((subtotal + deliveryFee) * 100) / 100

  // Find or create the customer by phone number.
  let customer = await queryOne<{ id: string }>(`SELECT id FROM customers WHERE phone = $1`, [d.customer.phone])
  if (!customer) {
    const id = newId()
    const rows = await query(
      `INSERT INTO customers (id, "fullName", phone, email, nationality, "passportId", telegram, whatsapp, "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8, now(), now()) RETURNING id`,
      [
        id,
        d.customer.fullName,
        d.customer.phone,
        d.customer.email || null,
        d.customer.nationality || null,
        d.customer.passportId || null,
        d.customer.telegram || null,
        d.customer.whatsapp || null
      ]
    )
    customer = rows[0]
  } else {
    await query(
      `UPDATE customers SET "fullName" = $1, email = COALESCE($2, email), nationality = COALESCE($3, nationality),
        telegram = COALESCE($4, telegram), whatsapp = COALESCE($5, whatsapp), "updatedAt" = now()
       WHERE id = $6`,
      [
        d.customer.fullName,
        d.customer.email || null,
        d.customer.nationality || null,
        d.customer.telegram || null,
        d.customer.whatsapp || null,
        customer.id
      ]
    )
  }

  const booking = await createBookingSafely({
    motorbikeId: motorbike.id,
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
    notes: d.notes || null
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
      customerName: d.customer.fullName
    }
  }
})
