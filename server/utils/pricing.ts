import { query } from './db'

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
}

export async function quotePrice(
  motorbike: MotorbikeForPricing,
  pickupDate: Date,
  returnDate: Date
): Promise<PriceQuote> {
  const days = daysBetween(pickupDate, returnDate)
  const ratePerDay = await getRatePerDay(motorbike, days)
  const subtotal = Math.round(ratePerDay * days * 100) / 100
  return { days, ratePerDay, subtotal }
}
