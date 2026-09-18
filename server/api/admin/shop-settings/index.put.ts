import { query } from '../../../utils/db'
import { requireShopAdmin } from '../../../utils/auth'
import { shopSettingsSchema } from '../../../utils/schemas'
import { logAudit } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
  const user = await requireShopAdmin(event, ['SUPER_ADMIN', 'ADMIN'])
  const parsed = shopSettingsSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message || 'Invalid settings' })
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
  params.push(user.shopId)

  const rows = await query(
    `UPDATE shops SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params
  )
  if (rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Shop not found' })
  }

  await logAudit(event, user.id, 'UPDATE_SHOP_SETTINGS', 'Shop', user.shopId, 'Updated shop settings', user.shopId)

  return { success: true, data: rows[0] }
})
