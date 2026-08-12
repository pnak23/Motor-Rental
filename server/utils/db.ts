import { Pool, type PoolClient, type QueryResultRow } from 'pg'
import { randomUUID } from 'node:crypto'

// A single shared connection pool for the whole server process.
// Reused across requests (Nitro keeps this module warm between requests).
let pool: Pool | undefined

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10
    })
  }
  return pool
}

/** Run a parameterized query against the pool. */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const res = await getPool().query<T>(text, params as unknown[])
  return res.rows
}

/** Run a parameterized query and return only the first row (or null). */
export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows[0] ?? null
}

/** Run a series of statements inside a single transaction. */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

/** Generate a URL-safe unique ID for primary keys (used app-side, like Prisma's cuid()). */
export function newId(): string {
  return randomUUID()
}

/** Generate a human-friendly booking number, e.g. SR-20260812-4471 */
export function newBookingNumber(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `SR-${y}${m}${d}-${rand}`
}
