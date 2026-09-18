import { z } from 'zod'
import { query, queryOne, newId } from '../../../utils/db'
import { requireShopAdmin } from '../../../utils/auth'

const bodySchema = z.object({
  motorbikeId: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['STANDARD', 'WEEKEND', 'HOLIDAY', 'PROMOTION', 'LONG_TERM']).default('STANDARD'),
  minDays: z.coerce.number().int().min(1),
  maxDays: z.coerce.number().int().optional().nullable(),
  pricePerDay: z.coerce.number().positive(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  active: z.coerce.boolean().default(true)
})

export default defineEventHandler(async (event) => {
  if (event.method === 'GET') {
    const user = await requireShopAdmin(event)
    const q = getQuery(event)
    const motorbikeId = q.motorbikeId as string | undefined
    if (motorbikeId) {
      const motorbike = await queryOne(`SELECT id FROM motorbikes WHERE id = $1 AND "shopId" = $2`, [motorbikeId, user.shopId])
      if (!motorbike) {
        throw createError({ statusCode: 404, statusMessage: 'Motorbike not found' })
      }
    }
    const rows = motorbikeId
      ? await query(`SELECT * FROM pricing_rules WHERE "motorbikeId" = $1 ORDER BY "minDays" ASC`, [motorbikeId])
      : await query(
          `SELECT r.* FROM pricing_rules r JOIN motorbikes m ON m.id = r."motorbikeId" WHERE m."shopId" = $1 ORDER BY r."createdAt" DESC`,
          [user.shopId]
        )
    return { success: true, data: rows }
  }

  const user = await requireShopAdmin(event, ['SUPER_ADMIN', 'ADMIN'])
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message || 'Invalid pricing rule' })
  }
  const d = parsed.data

  const motorbike = await queryOne(`SELECT id FROM motorbikes WHERE id = $1 AND "shopId" = $2`, [d.motorbikeId, user.shopId])
  if (!motorbike) {
    throw createError({ statusCode: 404, statusMessage: 'Motorbike not found' })
  }

  const id = newId()
  const rows = await query(
    `INSERT INTO pricing_rules (id, "motorbikeId", name, type, "minDays", "maxDays", "pricePerDay", "startDate", "endDate", active, "createdAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now()) RETURNING *`,
    [id, d.motorbikeId, d.name, d.type, d.minDays, d.maxDays ?? null, d.pricePerDay, d.startDate ?? null, d.endDate ?? null, d.active]
  )
  return { success: true, data: rows[0] }
})
