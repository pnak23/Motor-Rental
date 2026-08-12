import { z } from 'zod'
import { queryOne } from '../../utils/db'
import { verifyPassword, signAuthToken, AUTH_COOKIE } from '../../utils/auth'
import { logAudit } from '../../utils/audit'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

interface UserRow {
  id: string
  email: string
  password: string
  name: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF'
  isActive: boolean
}

export default defineEventHandler(async (event) => {
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Please provide a valid email and password' })
  }
  const { email, password } = parsed.data

  const user = await queryOne<UserRow>(`SELECT * FROM users WHERE email = $1`, [email.toLowerCase()])
  if (!user || !user.isActive) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  const validPassword = await verifyPassword(password, user.password)
  if (!validPassword) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  const token = signAuthToken(user.id)
  setCookie(event, AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  })

  await logAudit(event, user.id, 'LOGIN', 'User', user.id, `${user.email} logged in`)

  return {
    success: true,
    data: { id: user.id, email: user.email, name: user.name, role: user.role }
  }
})
