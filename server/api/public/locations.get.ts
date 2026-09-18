import { query, queryOne } from '../../utils/db'

/**
 * Locations are per-shop (each shop manages its own pickup/return points).
 * When a `motorbikeId` is given (the booking form always passes one), only
 * that motorbike's own shop's locations are returned — a customer booking a
 * bike from Shop A should never see Shop B's pickup points. Without a
 * `motorbikeId` (e.g. the general "Find Us" locations page, which lists
 * every shop's locations), all active locations across all shops are
 * returned as before.
 */
export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const motorbikeId = (q.motorbikeId as string) || ''

  if (motorbikeId) {
    const motorbike = await queryOne<{ shopId: string }>(`SELECT "shopId" FROM motorbikes WHERE id = $1`, [motorbikeId])
    if (!motorbike) {
      throw createError({ statusCode: 404, statusMessage: 'Motorbike not found' })
    }
    const rows = await query(
      `SELECT * FROM locations WHERE "isActive" = true AND "shopId" = $1 ORDER BY "sortOrder" ASC, name ASC`,
      [motorbike.shopId]
    )
    return { success: true, data: rows }
  }

  const rows = await query(`SELECT * FROM locations WHERE "isActive" = true ORDER BY "sortOrder" ASC, name ASC`)
  return { success: true, data: rows }
})
