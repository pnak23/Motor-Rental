const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending Review',
  CONFIRMED: 'Confirmed',
  PICKED_UP: 'Active (Picked Up)',
  RETURNED: 'Returned',
  CANCELLED: 'Cancelled',
  REJECTED: 'Rejected'
}

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

function layout(businessName: string, bodyHtml: string): string {
  return `
    <div style="font-family: -apple-system, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #21262b;">
      <h2 style="margin-bottom: 4px;">${businessName}</h2>
      ${bodyHtml}
      <p style="margin-top: 32px; font-size: 12px; color: #8b8f94;">This is an automated message from ${businessName}.</p>
    </div>
  `
}

export interface BookingEmailData {
  bookingNumber: string
  motorbikeName: string
  pickupDate: Date | string
  returnDate: Date | string
  total: number
  paidAmount: number
  status: string
  customerName: string
}

export function bookingConfirmationEmail(businessName: string, b: BookingEmailData) {
  return layout(
    businessName,
    `
    <p>Hi ${b.customerName},</p>
    <p>Thanks for your booking! Here are the details:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 4px 0; color: #8b8f94;">Booking #</td><td style="padding: 4px 0; text-align: right;"><strong>${b.bookingNumber}</strong></td></tr>
      <tr><td style="padding: 4px 0; color: #8b8f94;">Motorbike</td><td style="padding: 4px 0; text-align: right;">${b.motorbikeName}</td></tr>
      <tr><td style="padding: 4px 0; color: #8b8f94;">Pickup</td><td style="padding: 4px 0; text-align: right;">${formatDate(b.pickupDate)}</td></tr>
      <tr><td style="padding: 4px 0; color: #8b8f94;">Return</td><td style="padding: 4px 0; text-align: right;">${formatDate(b.returnDate)}</td></tr>
      <tr><td style="padding: 4px 0; color: #8b8f94;">Total</td><td style="padding: 4px 0; text-align: right;">$${b.total.toFixed(2)}</td></tr>
      <tr><td style="padding: 4px 0; color: #8b8f94;">Paid so far</td><td style="padding: 4px 0; text-align: right;">$${b.paidAmount.toFixed(2)}</td></tr>
      <tr><td style="padding: 4px 0; color: #8b8f94;">Status</td><td style="padding: 4px 0; text-align: right;">${STATUS_LABEL[b.status] || b.status}</td></tr>
    </table>
    <p>We'll be in touch to confirm your rental. Keep your booking number handy for any questions.</p>
  `
  )
}

export function bookingStatusUpdateEmail(businessName: string, b: BookingEmailData) {
  return layout(
    businessName,
    `
    <p>Hi ${b.customerName},</p>
    <p>Your booking <strong>${b.bookingNumber}</strong> for the ${b.motorbikeName} is now:</p>
    <p style="font-size: 20px; font-weight: 700; margin: 12px 0;">${STATUS_LABEL[b.status] || b.status}</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 4px 0; color: #8b8f94;">Pickup</td><td style="padding: 4px 0; text-align: right;">${formatDate(b.pickupDate)}</td></tr>
      <tr><td style="padding: 4px 0; color: #8b8f94;">Return</td><td style="padding: 4px 0; text-align: right;">${formatDate(b.returnDate)}</td></tr>
    </table>
    <p>Reply to this email or reach us directly if you have any questions.</p>
  `
  )
}

export function newBookingAdminAlertEmail(businessName: string, b: BookingEmailData) {
  return layout(
    businessName,
    `
    <p>A new booking needs review:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 4px 0; color: #8b8f94;">Booking #</td><td style="padding: 4px 0; text-align: right;"><strong>${b.bookingNumber}</strong></td></tr>
      <tr><td style="padding: 4px 0; color: #8b8f94;">Customer</td><td style="padding: 4px 0; text-align: right;">${b.customerName}</td></tr>
      <tr><td style="padding: 4px 0; color: #8b8f94;">Motorbike</td><td style="padding: 4px 0; text-align: right;">${b.motorbikeName}</td></tr>
      <tr><td style="padding: 4px 0; color: #8b8f94;">Pickup</td><td style="padding: 4px 0; text-align: right;">${formatDate(b.pickupDate)}</td></tr>
      <tr><td style="padding: 4px 0; color: #8b8f94;">Total / Paid</td><td style="padding: 4px 0; text-align: right;">$${b.total.toFixed(2)} / $${b.paidAmount.toFixed(2)}</td></tr>
    </table>
    <p>Log in to the admin panel to review and confirm it.</p>
  `
  )
}

export function pickupReminderEmail(businessName: string, b: BookingEmailData) {
  return layout(
    businessName,
    `
    <p>Hi ${b.customerName},</p>
    <p>Just a reminder — your pickup for booking <strong>${b.bookingNumber}</strong> (${b.motorbikeName}) is coming up:</p>
    <p style="font-size: 18px; font-weight: 700; margin: 12px 0;">${formatDate(b.pickupDate)}</p>
    <p>See you soon!</p>
  `
  )
}

export function returnReminderEmail(businessName: string, b: BookingEmailData) {
  return layout(
    businessName,
    `
    <p>Hi ${b.customerName},</p>
    <p>Just a reminder — your rental (booking <strong>${b.bookingNumber}</strong>, ${b.motorbikeName}) is due back:</p>
    <p style="font-size: 18px; font-weight: 700; margin: 12px 0;">${formatDate(b.returnDate)}</p>
    <p>Please return the motorbike on time to avoid a late fee.</p>
  `
  )
}
