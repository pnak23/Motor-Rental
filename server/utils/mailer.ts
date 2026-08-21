import nodemailer from 'nodemailer'

let transporter: nodemailer.Transporter | null | undefined

/** Lazily builds a transporter from SMTP_* env vars, or null if unconfigured. */
function getTransporter(): nodemailer.Transporter | null {
  if (transporter !== undefined) return transporter

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env
  if (!SMTP_HOST || !SMTP_PORT) {
    transporter = null
    return transporter
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASSWORD } : undefined
  })
  return transporter
}

/**
 * Sends an email if SMTP is configured; otherwise logs it to the server
 * console so the flow still works end-to-end in local development.
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const client = getTransporter()
  if (!client) {
    console.log(`[mailer] SMTP not configured — logging email instead.\nTo: ${to}\nSubject: ${subject}\n${html}`)
    return
  }

  await client.sendMail({
    from: process.env.SMTP_USER || 'no-reply@angkorwheels.com',
    to,
    subject,
    html
  })
}
