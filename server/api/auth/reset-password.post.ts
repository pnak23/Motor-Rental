import { z } from 'zod'
import { queryOne, query } from '../../utils/db'
import { hashResetToken, hashPassword } from '../../utils/auth'
import { logAudit } from '../../utils/audit'
import { enforceRateLimit } from '../../utils/rateLimit'

const bodySchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

interface TokenRow {
  id: string
  userId: string
  expiresAt: string
  usedAt: string | null
}

export default defineEventHandler(async (event) => {
  // Guard against brute-forcing reset tokens: 10 attempts per IP per 15 minutes.
  enforceRateLimit(event, 'reset-password', { max: 10, windowMs: 15 * 60 * 1000 })

  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message || 'Invalid request' })
  }
  const { token, password } = parsed.data

  const tokenHash = hashResetToken(token)
  const row = await queryOne<TokenRow>(
    `SELECT id, "userId", "expiresAt", "usedAt" FROM password_reset_tokens WHERE "tokenHash" = $1`,
    [tokenHash]
  )

  if (!row || row.usedAt || new Date(row.expiresAt) < new Date()) {
    throw createError({ statusCode: 400, statusMessage: 'This reset link is invalid or has expired' })
  }

  const passwordHash = await hashPassword(password)
  await query(`UPDATE users SET password = $1, "updatedAt" = now() WHERE id = $2`, [passwordHash, row.userId])
  await query(`UPDATE password_reset_tokens SET "usedAt" = now() WHERE id = $1`, [row.id])

  await logAudit(event, row.userId, 'RESET_PASSWORD', 'User', row.userId, 'Password reset via forgot-password flow')

  return { success: true, data: null }
})
