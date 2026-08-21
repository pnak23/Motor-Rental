import type { H3Event } from 'h3'

export interface ReportRange {
  from: string // 'YYYY-MM-DD'
  to: string // 'YYYY-MM-DD'
  days: number
  bucket: 'day' | 'week' | 'month'
}

function toDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/**
 * Reads ?from=&to= (YYYY-MM-DD) off the query string, defaulting to the
 * trailing 30 days. Also picks a sensible chart bucket size — daily for
 * short ranges, weekly/monthly for longer ones — so a year-long report
 * doesn't render 365 unreadable bars.
 */
export function getReportRange(event: H3Event): ReportRange {
  const q = getQuery(event)
  const now = new Date()
  const defaultTo = toDateOnly(now)
  const defaultFrom = toDateOnly(new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000))

  let from = (q.from as string) || defaultFrom
  let to = (q.to as string) || defaultTo

  if (Number.isNaN(new Date(from).getTime())) from = defaultFrom
  if (Number.isNaN(new Date(to).getTime())) to = defaultTo
  if (new Date(to) < new Date(from)) {
    ;[from, to] = [to, from]
  }

  const days = Math.max(1, Math.round((new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24)) + 1)
  const bucket: ReportRange['bucket'] = days <= 31 ? 'day' : days <= 180 ? 'week' : 'month'

  return { from, to, days, bucket }
}
