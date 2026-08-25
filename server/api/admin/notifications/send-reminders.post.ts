import { query } from '../../../utils/db'
import { notifyPickupReminder, notifyReturnReminder } from '../../../utils/notify'

/**
 * Sends pickup/return reminder emails for bookings coming up within the next
 * few hours. Not triggered by the app itself — nothing in this stack runs a
 * background scheduler — so it's meant to be hit periodically by an external
 * cron (a system crontab, a scheduled GitHub Action, Windows Task Scheduler,
 * a platform's cron add-on, etc.) hitting this endpoint with the shared
 * secret, e.g.:
 *   curl -X POST https://yoursite.com/api/admin/notifications/send-reminders \
 *     -H "x-cron-secret: $CRON_SECRET"
 * Each booking is only ever reminded once per stage (tracked via
 * pickupReminderSentAt / returnReminderSentAt), so it's safe to call this
 * as often as every few minutes.
 */
const LOOKAHEAD_HOURS = 3

interface ReminderBookingRow {
  id: string
  bookingNumber: string
  pickupDate: string
  returnDate: string
  total: string
  paidAmount: string
  status: string
  customerName: string
  customerEmail: string | null
  motorbikeName: string
}

export default defineEventHandler(async (event) => {
  const secret = getHeader(event, 'x-cron-secret')
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid or missing cron secret' })
  }

  const upcomingPickups = await query<ReminderBookingRow>(
    `SELECT b.id, b."bookingNumber", b."pickupDate", b."returnDate", b.total, b."paidAmount", b.status,
            c."fullName" as "customerName", c.email as "customerEmail", m.name as "motorbikeName"
     FROM bookings b
     JOIN customers c ON c.id = b."customerId"
     JOIN motorbikes m ON m.id = b."motorbikeId"
     WHERE b.status = 'CONFIRMED'
       AND b."pickupReminderSentAt" IS NULL
       AND b."pickupDate" > now()
       AND b."pickupDate" <= now() + ($1 || ' hours')::interval`,
    [LOOKAHEAD_HOURS]
  )
  for (const b of upcomingPickups) {
    await notifyPickupReminder(b.customerEmail, {
      bookingNumber: b.bookingNumber,
      motorbikeName: b.motorbikeName,
      pickupDate: b.pickupDate,
      returnDate: b.returnDate,
      total: Number(b.total),
      paidAmount: Number(b.paidAmount),
      status: b.status,
      customerName: b.customerName
    })
    await query(`UPDATE bookings SET "pickupReminderSentAt" = now() WHERE id = $1`, [b.id])
  }

  const upcomingReturns = await query<ReminderBookingRow>(
    `SELECT b.id, b."bookingNumber", b."pickupDate", b."returnDate", b.total, b."paidAmount", b.status,
            c."fullName" as "customerName", c.email as "customerEmail", m.name as "motorbikeName"
     FROM bookings b
     JOIN customers c ON c.id = b."customerId"
     JOIN motorbikes m ON m.id = b."motorbikeId"
     WHERE b.status = 'PICKED_UP'
       AND b."returnReminderSentAt" IS NULL
       AND b."returnDate" > now()
       AND b."returnDate" <= now() + ($1 || ' hours')::interval`,
    [LOOKAHEAD_HOURS]
  )
  for (const b of upcomingReturns) {
    await notifyReturnReminder(b.customerEmail, {
      bookingNumber: b.bookingNumber,
      motorbikeName: b.motorbikeName,
      pickupDate: b.pickupDate,
      returnDate: b.returnDate,
      total: Number(b.total),
      paidAmount: Number(b.paidAmount),
      status: b.status,
      customerName: b.customerName
    })
    await query(`UPDATE bookings SET "returnReminderSentAt" = now() WHERE id = $1`, [b.id])
  }

  return {
    success: true,
    data: { pickupRemindersSent: upcomingPickups.length, returnRemindersSent: upcomingReturns.length }
  }
})
