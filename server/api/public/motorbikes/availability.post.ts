import { z } from 'zod'
import { queryOne, getPool } from '../../../utils/db'
import { isMotorbikeAvailable } from '../../../utils/availability'
import { quotePrice } from '../../../utils/pricing'

const bodySchema = z.object({
  motorbikeId: z.string().min(1),
  pickupDate: z.string().min(1),
  returnDate: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Pickup and return dates are required' })
  }
  const { motorbikeId, pickupDate, returnDate } = parsed.data
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
    minRentalDays: number
    maxRentalDays: number
    status: string
  }>(`SELECT id, "dailyPrice", "weeklyPrice", "monthlyPrice", "minRentalDays", "maxRentalDays", status FROM motorbikes WHERE id = $1`, [
    motorbikeId
  ])
  if (!motorbike) {
    throw createError({ statusCode: 404, statusMessage: 'Motorbike not found' })
  }

  const quote = await quotePrice(motorbike, pickup, ret)

  if (quote.days < motorbike.minRentalDays) {
    return {
      success: true,
      data: { available: false, reason: `Minimum rental is ${motorbike.minRentalDays} day(s)`, ...quote }
    }
  }
  if (quote.days > motorbike.maxRentalDays) {
    return {
      success: true,
      data: { available: false, reason: `Maximum rental is ${motorbike.maxRentalDays} day(s)`, ...quote }
    }
  }
  if (motorbike.status !== 'AVAILABLE') {
    return { success: true, data: { available: false, reason: 'This motorbike is currently unavailable', ...quote } }
  }

  const client = await getPool().connect()
  let available = false
  try {
    available = await isMotorbikeAvailable(client, motorbikeId, pickup, ret)
  } finally {
    client.release()
  }

  return {
    success: true,
    data: {
      available,
      reason: available ? null : 'This motorbike is already booked for part of that date range',
      ...quote
    }
  }
})
