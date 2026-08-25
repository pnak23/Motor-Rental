import { query } from './db'
import { REQUIRED_DEPOSIT_RATIO } from './schemas'

export interface MotorbikeForPricing {
  id: string
  dailyPrice: string | number
  weeklyPrice: string | number | null
  monthlyPrice: string | number | null
}

export interface PricingRuleRow {
  id: string
  minDays: number
  maxDays: number | null
  pricePerDay: string | number
}

export function daysBetween(pickupDate: Date, returnDate: Date): number {
  const ms = returnDate.getTime() - pickupDate.getTime()
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

/** A rental of 12 hours or less is booked (and charged) as a half-day. */
export function isHalfDay(pickupDate: Date, returnDate: Date): boolean {
  const hours = (returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60)
  return hours > 0 && hours <= 12
}

/**
 * Determines the per-day rate for a given rental length.
 * Priority: an active, admin-configured pricing rule for this specific
 * motorbike that matches the day range, then the built-in daily / weekly /
 * monthly tiers on the motorbike itself.
 */
export async function getRatePerDay(motorbike: MotorbikeForPricing, days: number): Promise<number> {
  const rules = await query<PricingRuleRow>(
    `SELECT id, "minDays", "maxDays", "pricePerDay" FROM pricing_rules
     WHERE "motorbikeId" = $1 AND active = true
       AND "minDays" <= $2
       AND ("maxDays" IS NULL OR "maxDays" >= $2)
     ORDER BY "minDays" DESC LIMIT 1`,
    [motorbike.id, days]
  )
  if (rules[0]) return Number(rules[0].pricePerDay)

  const daily = Number(motorbike.dailyPrice)
  const weekly = motorbike.weeklyPrice != null ? Number(motorbike.weeklyPrice) : null
  const monthly = motorbike.monthlyPrice != null ? Number(motorbike.monthlyPrice) : null

  if (days >= 30 && monthly != null) return monthly / 30
  if (days >= 7 && weekly != null) return weekly / 7
  return daily
}

export interface PriceQuote {
  days: number
  ratePerDay: number
  subtotal: number
  isHalfDay: boolean
}

export async function quotePrice(
  motorbike: MotorbikeForPricing,
  pickupDate: Date,
  returnDate: Date
): Promise<PriceQuote> {
  if (isHalfDay(pickupDate, returnDate)) {
    const daily = Number(motorbike.dailyPrice)
    const ratePerDay = Math.round((daily / 2) * 100) / 100
    return { days: 0.5, ratePerDay, subtotal: ratePerDay, isHalfDay: true }
  }
  const days = daysBetween(pickupDate, returnDate)
  const ratePerDay = await getRatePerDay(motorbike, days)
  const subtotal = Math.round(ratePerDay * days * 100) / 100
  return { days, ratePerDay, subtotal, isHalfDay: false }
}

/** The minimum upfront payment required for a booking of this total. */
export function requiredDeposit(total: number): number {
  return Math.round(total * REQUIRED_DEPOSIT_RATIO * 100) / 100
}

/** Whether the amount paid so far satisfies the required deposit (with a
 *  small epsilon to tolerate floating-point rounding). */
export function meetsDepositRequirement(total: number, paidAmount: number): boolean {
  return paidAmount >= requiredDeposit(total) - 0.01
}

/**
 * Suggests a late fee when a motorbike is returned after its scheduled
 * return time, billed per hour (or part-hour) late. Returns 0 if returned
 * on time, no rate is configured, or actualReturnAt isn't after returnDate.
 */
export function calculateLateFee(returnDate: Date, actualReturnAt: Date, lateFeePerHour: number): number {
  if (!lateFeePerHour || actualReturnAt <= returnDate) return 0
  const hoursLate = Math.ceil((actualReturnAt.getTime() - returnDate.getTime()) / (1000 * 60 * 60))
  return Math.round(hoursLate * lateFeePerHour * 100) / 100
}
