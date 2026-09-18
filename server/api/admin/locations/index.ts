import { query, newId } from '../../../utils/db'
import { requireShopAdmin } from '../../../utils/auth'
import { locationSchema } from '../../../utils/schemas'

export default defineEventHandler(async (event) => {
  if (event.method === 'GET') {
    const user = await requireShopAdmin(event)
    const rows = await query(
      `SELECT * FROM locations WHERE "shopId" = $1 ORDER BY "sortOrder" ASC, name ASC`,
      [user.shopId]
    )
    return { success: true, data: rows }
  }

  const user = await requireShopAdmin(event, ['SUPER_ADMIN', 'ADMIN'])
  const parsed = locationSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message || 'Invalid location' })
  }
  const d = parsed.data
  const id = newId()
  const rows = await query(
    `INSERT INTO locations (id, "shopId", name, address, description, "googleMapsUrl", latitude, longitude, phone, "openingTime", "closingTime", "isActive", "sortOrder")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
    [id, user.shopId, d.name, d.address, d.description ?? null, d.googleMapsUrl ?? null, d.latitude ?? null, d.longitude ?? null, d.phone ?? null, d.openingTime ?? null, d.closingTime ?? null, d.isActive, d.sortOrder]
  )
  return { success: true, data: rows[0] }
})
