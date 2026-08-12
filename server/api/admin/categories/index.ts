import { query, newId } from '../../../utils/db'
import { requireAuth } from '../../../utils/auth'
import { slugify } from '../../../utils/response'
import { z } from 'zod'

const bodySchema = z.object({ name: z.string().min(1), description: z.string().optional().nullable() })

export default defineEventHandler(async (event) => {
  if (event.method === 'GET') {
    const rows = await query(`SELECT * FROM motorbike_categories ORDER BY name ASC`)
    return { success: true, data: rows }
  }

  await requireAuth(event, ['SUPER_ADMIN', 'ADMIN'])
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Category name is required' })
  }
  const id = newId()
  const slug = slugify(parsed.data.name)
  const rows = await query(
    `INSERT INTO motorbike_categories (id, name, slug, description) VALUES ($1,$2,$3,$4) RETURNING *`,
    [id, parsed.data.name, slug, parsed.data.description ?? null]
  )
  return { success: true, data: rows[0] }
})
