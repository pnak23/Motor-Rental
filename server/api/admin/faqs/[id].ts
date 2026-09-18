import { query } from '../../../utils/db'
import { requirePlatformAdmin } from '../../../utils/auth'
import { faqSchema } from '../../../utils/schemas'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (event.method === 'DELETE') {
    await requirePlatformAdmin(event)
    await query(`DELETE FROM faqs WHERE id = $1`, [id])
    return { success: true, data: null }
  }

  await requirePlatformAdmin(event)
  const parsed = faqSchema.partial().safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid FAQ data' })
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
  params.push(id)
  const rows = await query(`UPDATE faqs SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`, params)
  if (rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'FAQ not found' })
  }
  return { success: true, data: rows[0] }
})
