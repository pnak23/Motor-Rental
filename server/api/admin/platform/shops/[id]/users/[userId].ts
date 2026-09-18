import { query } from '../../../../../../utils/db'
import { requirePlatformAdmin, hashPassword } from '../../../../../../utils/auth'
import { logAudit } from '../../../../../../utils/audit'
import { userUpdateSchema as bodySchema } from '../../../../../../utils/schemas'

export default defineEventHandler(async (event) => {
  const admin = await requirePlatformAdmin(event)
  const shopId = getRouterParam(event, 'id')
  const userId = getRouterParam(event, 'userId')

  if (event.method === 'DELETE') {
    await query(`DELETE FROM users WHERE id = $1 AND "shopId" = $2`, [userId, shopId])
    await logAudit(event, admin.id, 'DELETE_USER', 'User', userId, 'Deleted admin user', shopId)
    return { success: true, data: null }
  }

  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid user update' })
  }
  const d = parsed.data

  const fields: string[] = []
  const params: unknown[] = []
  if (d.name !== undefined) {
    params.push(d.name)
    fields.push(`name = $${params.length}`)
  }
  if (d.role !== undefined) {
    params.push(d.role)
    fields.push(`role = $${params.length}`)
  }
  if (d.isActive !== undefined) {
    params.push(d.isActive)
    fields.push(`"isActive" = $${params.length}`)
  }
  if (d.password) {
    params.push(await hashPassword(d.password))
    fields.push(`password = $${params.length}`)
  }
  if (fields.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No fields to update' })
  }
  fields.push(`"updatedAt" = now()`)
  params.push(userId)
  params.push(shopId)

  const rows = await query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${params.length - 1} AND "shopId" = $${params.length} RETURNING id, email, name, role, "isActive"`,
    params
  )
  if (rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  await logAudit(event, admin.id, 'UPDATE_USER', 'User', userId, `Updated user ${rows[0].email}`, shopId)

  return { success: true, data: rows[0] }
})
