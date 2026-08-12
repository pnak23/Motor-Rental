import { query, newId, queryOne } from '../../../utils/db'
import { requireAuth } from '../../../utils/auth'
import { maintenanceSchema } from '../../../utils/schemas'
import { logAudit } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
  if (event.method === 'GET') {
    await requireAuth(event)
    const q = getQuery(event)
    const motorbikeId = q.motorbikeId as string | undefined
    const rows = motorbikeId
      ? await query(
          `SELECT r.*, m.name as "motorbikeName" FROM maintenance_records r JOIN motorbikes m ON m.id = r."motorbikeId" WHERE r."motorbikeId" = $1 ORDER BY r.date DESC`,
          [motorbikeId]
        )
      : await query(
          `SELECT r.*, m.name as "motorbikeName" FROM maintenance_records r JOIN motorbikes m ON m.id = r."motorbikeId" ORDER BY r.date DESC`
        )
    return { success: true, data: rows }
  }

  const user = await requireAuth(event, ['SUPER_ADMIN', 'ADMIN', 'STAFF'])
  const parsed = maintenanceSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message || 'Invalid maintenance record' })
  }
  const d = parsed.data
  const id = newId()
  const rows = await query(
    `INSERT INTO maintenance_records (id, "motorbikeId", type, description, date, mileage, cost, garage, notes, status, "createdAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now()) RETURNING *`,
    [id, d.motorbikeId, d.type, d.description ?? null, d.date, d.mileage ?? null, d.cost, d.garage ?? null, d.notes ?? null, d.status]
  )

  // A motorbike in active maintenance should not appear as available (section 21).
  if (d.status !== 'COMPLETED') {
    const activeBooking = await queryOne(
      `SELECT id FROM bookings WHERE "motorbikeId" = $1 AND status IN ('PENDING','CONFIRMED','PICKED_UP')`,
      [d.motorbikeId]
    )
    if (!activeBooking) {
      await query(`UPDATE motorbikes SET status = 'MAINTENANCE' WHERE id = $1`, [d.motorbikeId])
    }
  }

  await logAudit(event, user.id, 'CREATE_MAINTENANCE', 'Motorbike', d.motorbikeId, `Logged ${d.type} maintenance`)

  return { success: true, data: rows[0] }
})
