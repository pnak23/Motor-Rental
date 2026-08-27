import type { H3Event } from 'h3'

interface Bucket {
  count: number
  resetAt: number
}

// In-memory fixed-window counters, keyed by "bucket:ip". Fine for a single
// Node process (this app runs as one); a horizontally-scaled deployment
// would need a shared store (e.g. Redis) instead.
const buckets = new Map<string, Bucket>()

let lastSweep = Date.now()
function sweepExpired(now: number) {
  if (now - lastSweep < 60_000) return
  lastSweep = now
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

function clientIp(event: H3Event): string {
  const forwarded = getHeader(event, 'x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || event.node.req.socket?.remoteAddress || 'unknown'
}

/**
 * Throws a 429 once a client exceeds `max` requests to `bucket` within
 * `windowMs`. Call at the top of any public-facing handler that's cheap to
 * spam (auth, password reset, booking/contact form submission, etc).
 */
export function enforceRateLimit(event: H3Event, bucket: string, opts: { max: number; windowMs: number }): void {
  const now = Date.now()
  sweepExpired(now)

  const key = `${bucket}:${clientIp(event)}`
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs })
    return
  }

  existing.count += 1
  if (existing.count > opts.max) {
    setResponseHeader(event, 'Retry-After', String(Math.ceil((existing.resetAt - now) / 1000)))
    throw createError({ statusCode: 429, statusMessage: 'Too many requests. Please try again later.' })
  }
}
