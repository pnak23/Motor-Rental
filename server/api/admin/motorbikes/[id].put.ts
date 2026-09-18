import { motorbikeSchema } from '../../../utils/schemas'
import { query } from '../../../utils/db'
import { requireShopAdmin } from '../../../utils/auth'
import { logAudit } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
  const user = await requireShopAdmin(event, ['SUPER_ADMIN', 'ADMIN'])
  const id = getRouterParam(event, 'id')
  const parsed = motorbikeSchema.partial().safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message || 'Invalid motorbike data' })
  }
  const d = parsed.data

  const existing = await query(`SELECT id FROM motorbikes WHERE id = $1 AND "shopId" = $2`, [id, user.shopId])
  if (existing.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Motorbike not found' })
  }

  const fields: string[] = []
  const params: unknown[] = []
  for (const [key, value] of Object.entries(d)) {
    if (key === 'slug') continue // slug changes are intentionally not allowed via update to protect SEO/links
    params.push(value)
    fields.push(`"${key}" = $${params.length}`)
  }
  if (fields.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No fields to update' })
  }
  fields.push(`"updatedAt" = now()`)
  params.push(id)
  params.push(user.shopId)

  const rows = await query(
    `UPDATE motorbikes SET ${fields.join(', ')} WHERE id = $${params.length - 1} AND "shopId" = $${params.length} RETURNING *`,
    params
  )

  await logAudit(event, user.id, 'UPDATE_MOTORBIKE', 'Motorbike', id, `Updated ${rows[0]?.name}`, user.shopId)

  return { success: true, data: rows[0] }
})
