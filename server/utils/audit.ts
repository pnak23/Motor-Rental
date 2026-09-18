import type { H3Event } from 'h3'
import { query, newId } from './db'

export async function logAudit(
  event: H3Event,
  userId: string | null,
  action: string,
  entityType?: string,
  entityId?: string,
  description?: string,
  shopId?: string | null
) {
  const ip =
    getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ||
    event.node.req.socket?.remoteAddress ||
    null

  await query(
    `INSERT INTO audit_logs (id, "userId", "shopId", action, "entityType", "entityId", description, "ipAddress", "createdAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8, now())`,
    [newId(), userId, shopId ?? null, action, entityType ?? null, entityId ?? null, description ?? null, ip]
  )
}
