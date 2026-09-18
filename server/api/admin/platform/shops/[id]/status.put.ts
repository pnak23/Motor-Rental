import { query } from '../../../../../utils/db'
import { requirePlatformAdmin } from '../../../../../utils/auth'
import { shopStatusSchema } from '../../../../../utils/schemas'
import { logAudit } from '../../../../../utils/audit'

const ACTION_BY_STATUS: Record<string, string> = {
  ACTIVE: 'ACTIVATE_SHOP',
  PENDING: 'UPDATE_SHOP_STATUS',
  SUSPENDED: 'SUSPEND_SHOP',
  CLOSED: 'CLOSE_SHOP'
}

export default defineEventHandler(async (event) => {
  const user = await requirePlatformAdmin(event)
  const id = getRouterParam(event, 'id')

  const parsed = shopStatusSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message || 'Invalid status' })
  }
  const { status, reason } = parsed.data
  const isActive = status === 'ACTIVE'

  const rows = await query(
    `UPDATE shops SET "status" = $1, "suspendedReason" = $2, "statusChangedAt" = now(), "isActive" = $3, "updatedAt" = now()
     WHERE id = $4 RETURNING *`,
    [status, reason ?? null, isActive, id]
  )
  if (rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Shop not found' })
  }

  const action = ACTION_BY_STATUS[status] || 'UPDATE_SHOP_STATUS'
  const description = reason ? `Set shop ${rows[0].name} to ${status}: ${reason}` : `Set shop ${rows[0].name} to ${status}`
  await logAudit(event, user.id, action, 'Shop', id, description)

  return { success: true, data: rows[0] }
})
