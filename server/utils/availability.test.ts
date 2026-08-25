import { describe, it, expect, vi } from 'vitest'
import { getBookingConflict, isMotorbikeAvailable } from './availability'

/** A minimal fake pg client — just enough surface for these functions. */
function fakeClient(rows: unknown[]) {
  return { query: vi.fn().mockResolvedValue({ rows, rowCount: rows.length }) } as unknown as import('pg').PoolClient
}

describe('getBookingConflict', () => {
  it('returns null when there is no overlapping active booking', async () => {
    const client = fakeClient([])
    const conflict = await getBookingConflict(client, 'bike-1', new Date('2026-02-01'), new Date('2026-02-03'))
    expect(conflict).toBeNull()
  })

  it('returns the conflicting range when an overlap exists', async () => {
    const existing = { pickupDate: new Date('2026-02-02'), returnDate: new Date('2026-02-05') }
    const client = fakeClient([existing])
    const conflict = await getBookingConflict(client, 'bike-1', new Date('2026-02-01'), new Date('2026-02-03'))
    expect(conflict).toEqual(existing)
  })

  it('passes the active-status filter and requested range as query params', async () => {
    const client = fakeClient([])
    const pickup = new Date('2026-02-01')
    const ret = new Date('2026-02-03')
    await getBookingConflict(client, 'bike-1', pickup, ret)
    const [sql, params] = (client.query as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(sql).toContain('status = ANY($4')
    expect(params[0]).toBe('bike-1')
    expect(params[1]).toBe(pickup)
    expect(params[2]).toBe(ret)
    expect(params[3]).toEqual(['PENDING', 'CONFIRMED', 'PICKED_UP'])
  })

  it('excludes the given booking id when editing an existing booking', async () => {
    const client = fakeClient([])
    await getBookingConflict(client, 'bike-1', new Date('2026-02-01'), new Date('2026-02-03'), 'booking-9')
    const [sql, params] = (client.query as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(sql).toContain('id <> $5')
    expect(params[4]).toBe('booking-9')
  })
})

describe('isMotorbikeAvailable', () => {
  it('is true when there is no conflict', async () => {
    const client = fakeClient([])
    const available = await isMotorbikeAvailable(client, 'bike-1', new Date('2026-02-01'), new Date('2026-02-03'))
    expect(available).toBe(true)
  })

  it('is false when a conflict exists', async () => {
    const client = fakeClient([{ pickupDate: new Date('2026-02-02'), returnDate: new Date('2026-02-05') }])
    const available = await isMotorbikeAvailable(client, 'bike-1', new Date('2026-02-01'), new Date('2026-02-03'))
    expect(available).toBe(false)
  })
})
