import { queryOne } from '../../../../../../utils/db'
import { requirePlatformAdmin } from '../../../../../../utils/auth'

export default defineEventHandler(async (event) => {
  const admin = await requirePlatformAdmin(event)
  const shopId = getRouterParam(event, 'id') as string

  const request = await queryOne<{ status: string; expiresAt: string; usedAt: string | null }>(
    `SELECT * FROM shop_access_requests WHERE "shopId" = $1 AND "requestedById" = $2 ORDER BY "requestedAt" DESC LIMIT 1`,
    [shopId, admin.id]
  )
  if (!request) {
    return { success: true, data: null }
  }

  // Present (but don't persist) expiry — the DB row is only ever updated by approve/deny/enter.
  const isLive = (request.status === 'PENDING' || request.status === 'APPROVED') && !request.usedAt
  const isExpired = isLive && new Date(request.expiresAt).getTime() < Date.now()

  return { success: true, data: { ...request, status: isExpired ? 'EXPIRED' : request.status } }
})
