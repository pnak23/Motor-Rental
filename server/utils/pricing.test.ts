import { describe, it, expect, vi, beforeEach } from 'vitest'

const queryMock = vi.fn()
vi.mock('./db', () => ({
  query: (...args: unknown[]) => queryMock(...args)
}))

const { daysBetween, isHalfDay, getRatePerDay, quotePrice, requiredDeposit, meetsDepositRequirement, calculateLateFee } =
  await import('./pricing')

const bike = { id: 'bike-1', dailyPrice: '10', weeklyPrice: '60', monthlyPrice: '210' }

beforeEach(() => {
  queryMock.mockReset()
  queryMock.mockResolvedValue([]) // no admin pricing_rules by default
})

describe('daysBetween', () => {
  it('rounds a partial day up to a full day', () => {
    const pickup = new Date('2026-01-01T09:00:00Z')
    const ret = new Date('2026-01-02T08:00:00Z') // 23h later
    expect(daysBetween(pickup, ret)).toBe(1)
  })

  it('counts an exact multi-day span correctly', () => {
    const pickup = new Date('2026-01-01T09:00:00Z')
    const ret = new Date('2026-01-04T09:00:00Z') // exactly 3 days
    expect(daysBetween(pickup, ret)).toBe(3)
  })

  it('never returns less than 1', () => {
    const pickup = new Date('2026-01-01T09:00:00Z')
    const ret = new Date('2026-01-01T09:30:00Z')
    expect(daysBetween(pickup, ret)).toBe(1)
  })
})

describe('isHalfDay', () => {
  it('is true for exactly 12 hours', () => {
    const pickup = new Date('2026-01-01T09:00:00Z')
    const ret = new Date('2026-01-01T21:00:00Z')
    expect(isHalfDay(pickup, ret)).toBe(true)
  })

  it('is false for just over 12 hours', () => {
    const pickup = new Date('2026-01-01T09:00:00Z')
    const ret = new Date('2026-01-01T21:01:00Z')
    expect(isHalfDay(pickup, ret)).toBe(false)
  })

  it('is false for a non-positive span', () => {
    const d = new Date('2026-01-01T09:00:00Z')
    expect(isHalfDay(d, d)).toBe(false)
  })
})

describe('getRatePerDay', () => {
  it('falls back to the daily rate for a short rental', async () => {
    const rate = await getRatePerDay(bike, 3)
    expect(rate).toBe(10)
  })

  it('uses the weekly rate (pro-rated) at 7+ days', async () => {
    const rate = await getRatePerDay(bike, 7)
    expect(rate).toBeCloseTo(60 / 7)
  })

  it('uses the monthly rate (pro-rated) at 30+ days', async () => {
    const rate = await getRatePerDay(bike, 30)
    expect(rate).toBeCloseTo(210 / 30)
  })

  it('prefers an active admin pricing rule over the built-in tiers', async () => {
    queryMock.mockResolvedValueOnce([{ id: 'rule-1', minDays: 1, maxDays: null, pricePerDay: '7.5' }])
    const rate = await getRatePerDay(bike, 3)
    expect(rate).toBe(7.5)
  })
})

describe('quotePrice', () => {
  it('charges a flat half-day rate (50% of daily) for a short rental', async () => {
    const pickup = new Date('2026-01-01T09:00:00Z')
    const ret = new Date('2026-01-01T15:00:00Z') // 6h
    const quote = await quotePrice(bike, pickup, ret)
    expect(quote.isHalfDay).toBe(true)
    expect(quote.days).toBe(0.5)
    expect(quote.subtotal).toBe(5)
  })

  it('computes subtotal as rate * days for a multi-day rental', async () => {
    const pickup = new Date('2026-01-01T09:00:00Z')
    const ret = new Date('2026-01-04T09:00:00Z') // 3 days
    const quote = await quotePrice(bike, pickup, ret)
    expect(quote.isHalfDay).toBe(false)
    expect(quote.days).toBe(3)
    expect(quote.subtotal).toBe(30)
  })
})

describe('requiredDeposit / meetsDepositRequirement', () => {
  it('requires exactly 50% of the total', () => {
    expect(requiredDeposit(100)).toBe(50)
    expect(requiredDeposit(33)).toBe(16.5)
  })

  it('accepts an amount at or above the required deposit', () => {
    expect(meetsDepositRequirement(100, 50)).toBe(true)
    expect(meetsDepositRequirement(100, 100)).toBe(true)
  })

  it('tolerates a tiny floating-point shortfall', () => {
    expect(meetsDepositRequirement(100, 49.995)).toBe(true)
  })

  it('rejects a genuinely insufficient amount', () => {
    expect(meetsDepositRequirement(100, 49)).toBe(false)
    expect(meetsDepositRequirement(100, 0)).toBe(false)
  })
})

describe('calculateLateFee', () => {
  it('is zero when returned on time or early', () => {
    const returnDate = new Date('2026-01-05T10:00:00Z')
    expect(calculateLateFee(returnDate, returnDate, 5)).toBe(0)
    expect(calculateLateFee(returnDate, new Date('2026-01-05T09:00:00Z'), 5)).toBe(0)
  })

  it('is zero when no hourly rate is configured', () => {
    const returnDate = new Date('2026-01-05T10:00:00Z')
    const late = new Date('2026-01-05T15:00:00Z')
    expect(calculateLateFee(returnDate, late, 0)).toBe(0)
  })

  it('rounds a partial hour late up to a full hour', () => {
    const returnDate = new Date('2026-01-05T10:00:00Z')
    const late = new Date('2026-01-05T10:01:00Z') // 1 minute late
    expect(calculateLateFee(returnDate, late, 5)).toBe(5)
  })

  it('charges per full hour late', () => {
    const returnDate = new Date('2026-01-05T10:00:00Z')
    const late = new Date('2026-01-05T13:00:00Z') // exactly 3 hours late
    expect(calculateLateFee(returnDate, late, 5)).toBe(15)
  })
})
