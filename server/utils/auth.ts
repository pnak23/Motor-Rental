import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createHash, randomBytes } from 'node:crypto'
import type { H3Event } from 'h3'
import { queryOne } from './db'

export const AUTH_COOKIE = 'admin_session'
/** Holds the platform admin's own token while they're impersonating a shop user (see platform/shops/[id]/impersonate.post.ts). */
export const IMPERSONATOR_COOKIE = 'impersonator_session'

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'STAFF'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: AdminRole
  isActive: boolean
  /** NULL for a platform-level super admin; otherwise the shop this user belongs to. */
  shopId: string | null
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

export function signAuthToken(userId: string, expiresIn: string = '1d'): string {
  return jwt.sign({ sub: userId } satisfies JwtPayload, getSecret(), { expiresIn })
}

/** Generates a raw, URL-safe password-reset token plus its SHA-256 hash for storage. */
export function generateResetToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString('hex')
  return { token, hash: hashResetToken(token) }
}

export function hashResetToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function verifyAuthToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getSecret()) as JwtPayload
  } catch {
    return null
  }
}

/** Resolve the admin user a session token belongs to, or null. Shared by both the
 *  cookie-based HTTP auth below and the WebSocket upgrade handler (which has no H3Event). */
export async function getAuthUserFromToken(token: string | undefined | null): Promise<AuthUser | null> {
  if (!token) return null
  const payload = verifyAuthToken(token)
  if (!payload) return null

  const user = await queryOne<AuthUser>(
    `SELECT id, email, name, role, "isActive", "shopId" FROM users WHERE id = $1`,
    [payload.sub]
  )
  if (!user || !user.isActive) return null
  return user
}

/** Resolve the currently logged-in admin user from the session cookie, or null. */
export async function getAuthUser(event: H3Event): Promise<AuthUser | null> {
  return getAuthUserFromToken(getCookie(event, AUTH_COOKIE))
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

/**
 * Require a logged-in user who belongs to a shop (i.e. not a platform-level
 * super admin), optionally restricted to specific roles. Use at the top of
 * any shop-scoped /api/admin/** handler; the returned `shopId` should be
 * used to filter every query in that handler.
 */
export async function requireShopAdmin(
  event: H3Event,
  roles?: AdminRole[]
): Promise<AuthUser & { shopId: string }> {
  const user = await requireAuth(event, roles)
  if (!user.shopId) {
    throw createError({ statusCode: 400, statusMessage: 'This action requires a shop-level account' })
  }
  return user as AuthUser & { shopId: string }
}

/**
 * Require a platform-level super admin (a SUPER_ADMIN with no shop of
 * their own). Use for routes that manage Shop records themselves, e.g.
 * /api/admin/platform/**.
 */
export async function requirePlatformAdmin(event: H3Event): Promise<AuthUser> {
  const user = await requireAuth(event, ['SUPER_ADMIN'])
  if (user.shopId) {
    throw createError({ statusCode: 403, statusMessage: 'This action requires a platform-level account' })
  }
  return user
}
