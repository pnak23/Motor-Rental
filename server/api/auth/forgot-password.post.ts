import { z } from 'zod'
import { queryOne, query, newId } from '../../utils/db'
import { generateResetToken } from '../../utils/auth'
import { sendEmail } from '../../utils/mailer'

const bodySchema = z.object({
  email: z.string().email()
})

interface UserRow {
  id: string
  email: string
  name: string
  isActive: boolean
}

export default defineEventHandler(async (event) => {
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Please provide a valid email address' })
  }
  const { email } = parsed.data

  const user = await queryOne<UserRow>(
    `SELECT id, email, name, "isActive" FROM users WHERE email = $1`,
    [email.toLowerCase()]
  )

  // Always respond the same way whether the account exists or not, so the
  // form can't be used to enumerate registered admin emails.
  if (user && user.isActive) {
    const { token, hash } = generateResetToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await query(
      `INSERT INTO password_reset_tokens (id, "userId", "tokenHash", "expiresAt", "createdAt")
       VALUES ($1, $2, $3, $4, now())`,
      [newId(), user.id, hash, expiresAt]
    )

    const appUrl = useRuntimeConfig().public.appUrl as string
    const resetUrl = `${appUrl}/admin/reset-password?token=${token}`

    await sendEmail(
      user.email,
      'Reset your Angkor Wheels admin password',
      `<p>Hi ${user.name},</p>
       <p>We received a request to reset your admin password. This link expires in 1 hour:</p>
       <p><a href="${resetUrl}">${resetUrl}</a></p>
       <p>If you didn't request this, you can safely ignore this email.</p>`
    )
  }

  return { success: true, data: null }
})
