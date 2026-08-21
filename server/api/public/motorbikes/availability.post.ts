import { z } from 'zod'
import { queryOne, getPool } from '../../../utils/db'
import { getBookingConflict } from '../../../utils/availability'
import { quotePrice } from '../../../utils/pricing'
import { REQUIRED_DEPOSIT_RATIO } from '../../../utils/schemas'

const bodySchema = z.object({
  motorbikeId: z.string().min(1),
  pickupDate: z.string().min(1),
  returnDate: z.string().min(1),
  excludeBookingId: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Pickup and return dates are required' })
  }
  const { motorbikeId, pickupDate, returnDate, excludeBookingId } = parsed.data
  const pickup = new Date(pickupDate)
  const ret = new Date(returnDate)

  if (Number.isNaN(pickup.getTime()) || Number.isNaN(ret.getTime()) || ret <= pickup) {
    throw createError({ statusCode: 400, statusMessage: 'Return date must be after the pickup date' })
  }

  const motorbike = await queryOne<{
    id: string
    dailyPrice: string
    weeklyPrice: string | null
    monthlyPrice: string | null
    deliveryFee: string
    minRentalDays: number
    maxRentalDays: number
    status: string
  }>(
    `SELECT id, "dailyPrice", "weeklyPrice", "monthlyPrice", "deliveryFee", "minRentalDays", "maxRentalDays", status FROM motorbikes WHERE id = $1`,
    [motorbikeId]
  )
  if (!motorbike) {
    throw createError({ statusCode: 404, statusMessage: 'Motorbike not found' })
  }

  const quote = await quotePrice(motorbike, pickup, ret)
  const deliveryFee = Number(motorbike.deliveryFee) || 0
  const total = Math.round((quote.subtotal + deliveryFee) * 100) / 100
  const requiredDeposit = Math.round(total * REQUIRED_DEPOSIT_RATIO * 100) / 100

  // Half-day rentals are an explicit shorter option and bypass the
  // motorbike's normal min/max rental-day window.
  if (!quote.isHalfDay && quote.days < motorbike.minRentalDays) {
    return {
      success: true,
      data: { available: false, reason: `Minimum rental is ${motorbike.minRentalDays} day(s)`, conflict: null, total, requiredDeposit, ...quote }
    }
  }
  if (!quote.isHalfDay && quote.days > motorbike.maxRentalDays) {
    return {
      success: true,
      data: { available: false, reason: `Maximum rental is ${motorbike.maxRentalDays} day(s)`, conflict: null, total, requiredDeposit, ...quote }
    }
  }
  if (motorbike.status === 'MAINTENANCE' || motorbike.status === 'INACTIVE') {
    return {
      success: true,
      data: {
        available: false,
        reason: `This motorbike is currently in ${motorbike.status.toLowerCase()}`,
        conflict: null,
        total,
        requiredDeposit,
        ...quote
      }
    }
  }

  const conflict = await getBookingConflict(getPool(), motorbikeId, pickup, ret, excludeBookingId)

  return {
    success: true,
    data: {
      available: conflict === null,
      reason: conflict ? 'This motorbike is already reserved for part of that date range' : null,
      conflict,
      total,
      requiredDeposit,
      ...quote
    }
  }
})
