import { query, queryOne } from '../../../../utils/db'
import { requirePlatformAdmin } from '../../../../utils/auth'
import { shopUpdateSchema } from '../../../../utils/schemas'
import { logAudit } from '../../../../utils/audit'

export default defineEventHandler(async (event) => {
  const user = await requirePlatformAdmin(event)
  const id = getRouterParam(event, 'id')

  if (event.method === 'GET') {
    const shop = await queryOne(
      `SELECT s.*,
        (SELECT u.name FROM users u WHERE u."shopId" = s.id ORDER BY u."createdAt" ASC LIMIT 1) as "ownerName",
        (SELECT u.email FROM users u WHERE u."shopId" = s.id ORDER BY u."createdAt" ASC LIMIT 1) as "ownerEmail",
        (SELECT COUNT(*) FROM users u WHERE u."shopId" = s.id)::int as "userCount",
        (SELECT COUNT(*) FROM bookings b WHERE b."shopId" = s.id)::int as "bookingCount",
        (SELECT MAX(a."createdAt") FROM audit_logs a WHERE a."shopId" = s.id) as "lastActivity"
       FROM shops s WHERE s.id = $1`,
      [id]
    )
    if (!shop) {
      throw createError({ statusCode: 404, statusMessage: 'Shop not found' })
    }
    return { success: true, data: shop }
  }

  const parsed = shopUpdateSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message || 'Invalid shop data' })
  }
  const fields: string[] = []
  const params: unknown[] = []
  for (const [key, value] of Object.entries(parsed.data)) {
    params.push(value)
    fields.push(`"${key}" = $${params.length}`)
  }
  if (fields.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No fields to update' })
  }
  fields.push(`"updatedAt" = now()`)
  params.push(id)
  const rows = await query(`UPDATE shops SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`, params)
  if (rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Shop not found' })
  }

  await logAudit(event, user.id, 'UPDATE_SHOP', 'Shop', id, `Updated shop ${rows[0].name}`)

  return { success: true, data: rows[0] }
})
