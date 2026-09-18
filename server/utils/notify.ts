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

/**
 * emailNotificationsEnabled is a platform-wide on/off switch (business_settings
 * is the platform-wide singleton), but the name/email used in the email
 * content and as the "new booking" alert recipient come from the specific
 * shop the booking belongs to, so each shop gets its own booking alerts and
 * its own branding in customer-facing emails.
 */
async function getNotificationSettings(shopId: string): Promise<NotificationSettings | null> {
  const platformSettings = await queryOne<{ emailNotificationsEnabled: boolean }>(
    `SELECT "emailNotificationsEnabled" FROM business_settings WHERE id = 'main'`
  )
  if (!platformSettings || !platformSettings.emailNotificationsEnabled) return null

  const shop = await queryOne<{ name: string; email: string | null }>(
    `SELECT name, email FROM shops WHERE id = $1`,
    [shopId]
  )
  if (!shop) return null

  return {
    businessName: shop.name,
    email: shop.email,
    emailNotificationsEnabled: platformSettings.emailNotificationsEnabled
  }
}

/** Sends the booking confirmation to the customer, plus a new-booking alert
 *  to the business inbox. Never throws — a failed email should never break
 *  the booking flow itself. */
export async function notifyBookingCreated(customerEmail: string | null | undefined, shopId: string, data: BookingEmailData) {
  try {
    const settings = await getNotificationSettings(shopId)
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

export async function notifyBookingStatusChanged(customerEmail: string | null | undefined, shopId: string, data: BookingEmailData) {
  if (!customerEmail) return
  try {
    const settings = await getNotificationSettings(shopId)
    if (!settings) return
    await sendEmail(customerEmail, `Booking ${data.bookingNumber} update`, bookingStatusUpdateEmail(settings.businessName, data))
  } catch (err) {
    console.error('[notify] Failed to send status-update email', err)
  }
}

export async function notifyPickupReminder(customerEmail: string | null | undefined, shopId: string, data: BookingEmailData) {
  if (!customerEmail) return
  try {
    const settings = await getNotificationSettings(shopId)
    if (!settings) return
    await sendEmail(customerEmail, `Reminder: pickup for booking ${data.bookingNumber}`, pickupReminderEmail(settings.businessName, data))
  } catch (err) {
    console.error('[notify] Failed to send pickup reminder', err)
  }
}

export async function notifyReturnReminder(customerEmail: string | null | undefined, shopId: string, data: BookingEmailData) {
  if (!customerEmail) return
  try {
    const settings = await getNotificationSettings(shopId)
    if (!settings) return
    await sendEmail(customerEmail, `Reminder: return due for booking ${data.bookingNumber}`, returnReminderEmail(settings.businessName, data))
  } catch (err) {
    console.error('[notify] Failed to send return reminder', err)
  }
}
