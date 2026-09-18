import { query, queryOne } from '../../../utils/db'
import { requireShopAdmin } from '../../../utils/auth'
import { maintenanceSchema } from '../../../utils/schemas'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (event.method === 'DELETE') {
    const user = await requireShopAdmin(event, ['SUPER_ADMIN', 'ADMIN'])
    const record = await queryOne(
      `SELECT r.id FROM maintenance_records r JOIN motorbikes m ON m.id = r."motorbikeId" WHERE r.id = $1 AND m."shopId" = $2`,
      [id, user.shopId]
    )
    if (!record) {
      throw createError({ statusCode: 404, statusMessage: 'Maintenance record not found' })
    }
    await query(`DELETE FROM maintenance_records WHERE id = $1`, [id])
    return { success: true, data: null }
  }

  const user = await requireShopAdmin(event, ['SUPER_ADMIN', 'ADMIN', 'STAFF'])
  const record = await queryOne(
    `SELECT r.id FROM maintenance_records r JOIN motorbikes m ON m.id = r."motorbikeId" WHERE r.id = $1 AND m."shopId" = $2`,
    [id, user.shopId]
  )
  if (!record) {
    throw createError({ statusCode: 404, statusMessage: 'Maintenance record not found' })
  }
  const parsed = maintenanceSchema.partial().safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid maintenance data' })
  }
  if (parsed.data.motorbikeId) {
    const motorbike = await queryOne(`SELECT id FROM motorbikes WHERE id = $1 AND "shopId" = $2`, [
      parsed.data.motorbikeId,
      user.shopId
    ])
    if (!motorbike) {
      throw createError({ statusCode: 404, statusMessage: 'Motorbike not found' })
    }
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
  const rows = await query(
    `UPDATE maintenance_records SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params
  )
  if (rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Maintenance record not found' })
  }

  if (parsed.data.status === 'COMPLETED') {
    await query(`UPDATE motorbikes SET status = 'AVAILABLE' WHERE id = $1 AND status = 'MAINTENANCE'`, [
      rows[0].motorbikeId
    ])
  }

  return { success: true, data: rows[0] }
})
