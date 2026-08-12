import { query } from '../../../utils/db'
import { requireAuth } from '../../../utils/auth'
import { locationSchema } from '../../../utils/schemas'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (event.method === 'DELETE') {
    await requireAuth(event, ['SUPER_ADMIN', 'ADMIN'])
    await query(`DELETE FROM locations WHERE id = $1`, [id])
    return { success: true, data: null }
  }

  await requireAuth(event, ['SUPER_ADMIN', 'ADMIN'])
  const parsed = locationSchema.partial().safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid location data' })
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
  const rows = await query(`UPDATE locations SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`, params)
  if (rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Location not found' })
  }
  return { success: true, data: rows[0] }
})
