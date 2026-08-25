import { queryOne } from './db'
import { sendEmail } from './mailer'
import {
  bookingConfirmationEmail,
  bookingStatusUpdateEmail,
  newBookingAdminAlertEmail,
  pickupReminderEmail,
  returnReminderEmail,
  type BookingEmailData
} from './emailTemplates'

interface NotificationSettings {
  businessName: string
  email: string | null
  emailNotificationsEnabled: boolean
}

async function getNotificationSettings(): Promise<NotificationSettings | null> {
  const settings = await queryOne<NotificationSettings>(
    `SELECT "businessName", email, "emailNotificationsEnabled" FROM business_settings WHERE id = 'main'`
  )
  if (!settings || !settings.emailNotificationsEnabled) return null
  return settings
}

/** Sends the booking confirmation to the customer, plus a new-booking alert
 *  to the business inbox. Never throws — a failed email should never break
 *  the booking flow itself. */
export async function notifyBookingCreated(customerEmail: string | null | undefined, data: BookingEmailData) {
  try {
    const settings = await getNotificationSettings()
    if (!settings) return
    if (customerEmail) {
      await sendEmail(customerEmail, `Booking confirmation — ${data.bookingNumber}`, bookingConfirmationEmail(settings.businessName, data))
    }
    if (settings.email) {
      await sendEmail(settings.email, `New booking — ${data.bookingNumber}`, newBookingAdminAlertEmail(settings.businessName, data))
    }
  } catch (err) {
    console.error('[notify] Failed to send booking-created emails', err)
  }
}

export async function notifyBookingStatusChanged(customerEmail: string | null | undefined, data: BookingEmailData) {
  if (!customerEmail) return
  try {
    const settings = await getNotificationSettings()
    if (!settings) return
    await sendEmail(customerEmail, `Booking ${data.bookingNumber} update`, bookingStatusUpdateEmail(settings.businessName, data))
  } catch (err) {
    console.error('[notify] Failed to send status-update email', err)
  }
}

export async function notifyPickupReminder(customerEmail: string | null | undefined, data: BookingEmailData) {
  if (!customerEmail) return
  try {
    const settings = await getNotificationSettings()
    if (!settings) return
    await sendEmail(customerEmail, `Reminder: pickup for booking ${data.bookingNumber}`, pickupReminderEmail(settings.businessName, data))
  } catch (err) {
    console.error('[notify] Failed to send pickup reminder', err)
  }
}

export async function notifyReturnReminder(customerEmail: string | null | undefined, data: BookingEmailData) {
  if (!customerEmail) return
  try {
    const settings = await getNotificationSettings()
    if (!settings) return
    await sendEmail(customerEmail, `Reminder: return due for booking ${data.bookingNumber}`, returnReminderEmail(settings.businessName, data))
  } catch (err) {
    console.error('[notify] Failed to send return reminder', err)
  }
}
