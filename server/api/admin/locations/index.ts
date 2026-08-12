import { query, newId } from '../../../utils/db'
import { requireAuth } from '../../../utils/auth'
import { locationSchema } from '../../../utils/schemas'

export default defineEventHandler(async (event) => {
  if (event.method === 'GET') {
    await requireAuth(event)
    const rows = await query(`SELECT * FROM locations ORDER BY "sortOrder" ASC, name ASC`)
    return { success: true, data: rows }
  }

  const user = await requireAuth(event, ['SUPER_ADMIN', 'ADMIN'])
  const parsed = locationSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message || 'Invalid location' })
  }
  const d = parsed.data
  const id = newId()
  const rows = await query(
    `INSERT INTO locations (id, name, address, description, "googleMapsUrl", latitude, longitude, phone, "openingTime", "closingTime", "isActive", "sortOrder")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [id, d.name, d.address, d.description ?? null, d.googleMapsUrl ?? null, d.latitude ?? null, d.longitude ?? null, d.phone ?? null, d.openingTime ?? null, d.closingTime ?? null, d.isActive, d.sortOrder]
  )
  void user
  return { success: true, data: rows[0] }
})
