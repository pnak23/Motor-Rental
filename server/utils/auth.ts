import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'
import { queryOne } from './db'

export const AUTH_COOKIE = 'admin_session'

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'STAFF'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: AdminRole
  isActive: boolean
}

interface JwtPayload {
  sub: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

function getSecret(): string {
  const config = useRuntimeConfig()
  return config.jwtSecret as string
}

export function signAuthToken(userId: string): string {
  return jwt.sign({ sub: userId } satisfies JwtPayload, getSecret(), { expiresIn: '7d' })
}

export function verifyAuthToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getSecret()) as JwtPayload
  } catch {
    return null
  }
}

/** Resolve the currently logged-in admin user from the session cookie, or null. */
export async function getAuthUser(event: H3Event): Promise<AuthUser | null> {
  const token = getCookie(event, AUTH_COOKIE)
  if (!token) return null
  const payload = verifyAuthToken(token)
  if (!payload) return null

  const user = await queryOne<AuthUser>(
    `SELECT id, email, name, role, "isActive" FROM users WHERE id = $1`,
    [payload.sub]
  )
  if (!user || !user.isActive) return null
  return user
}

/**
 * Require a logged-in admin user for this request, optionally restricted to
 * specific roles. Throws a 401/403 H3 error otherwise. Use at the top of any
 * /api/admin/** handler.
 */
export async function requireAuth(event: H3Event, roles?: AdminRole[]): Promise<AuthUser> {
  const user = await getAuthUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    throw createError({ statusCode: 403, statusMessage: 'You do not have permission to do this' })
  }
  return user
}
