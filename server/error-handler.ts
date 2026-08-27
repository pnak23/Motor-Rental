import { isError, send, setResponseHeader, setResponseStatus } from 'h3'
import type { H3Event } from 'h3'

/**
 * Runs before Nitro's built-in error renderer. Our own `createError(...)`
 * calls (validation failures, 401/403/404s, etc.) are intentional and safe
 * to show as-is, so we let those fall through to the default handler.
 *
 * Anything else — a raw exception from `pg`, a bug, a third-party API
 * failure — gets replaced with a generic message here so database/internal
 * error details (table/column names, constraint violations, stack traces)
 * never reach the client, regardless of NODE_ENV. The real error is still
 * logged server-side for debugging.
 */
export default async function errorHandler(error: unknown, event: H3Event) {
  const isIntentional = isError(error) && !error.unhandled && !error.fatal
  if (isIntentional) return // let the default handler render it

  console.error('[unhandled server error]', event.path, error)

  const statusCode = 500
  const statusMessage = 'Something went wrong. Please try again later.'
  setResponseStatus(event, statusCode, statusMessage)
  setResponseHeader(event, 'Content-Type', 'application/json')
  await send(event, JSON.stringify({ url: event.path || '', statusCode, statusMessage, message: statusMessage }))
}
