import { z } from 'zod'
import { query, queryOne } from '../../../utils/db'
import { requireShopAdmin } from '../../../utils/auth'
import { logAudit } from '../../../utils/audit'
import { customerIdTypeEnum } from '../../../utils/schemas'

const bodySchema = z.object({
  fullName: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  email: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  idType: customerIdTypeEnum.optional().nullable(),
  passportId: z.string().optional().nullable(),
  telegram: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  isBlocked: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  const user = await requireShopAdmin(event, ['SUPER_ADMIN', 'ADMIN', 'STAFF'])
  const id = getRouterParam(event, 'id')
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid customer data' })
  }

  const owned = await queryOne<{ id: string }>(
    `SELECT 1 as id FROM bookings WHERE "customerId" = $1 AND "shopId" = $2 LIMIT 1`,
    [id, user.shopId]
  )
  if (!owned) {
    throw createError({ statusCode: 404, statusMessage: 'Customer not found' })
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
  fields.push(`"updatedAt" = now()`)
  params.push(id)

  const rows = await query(`UPDATE customers SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`, params)
  if (rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Customer not found' })
  }

  await logAudit(event, user.id, 'UPDATE_CUSTOMER', 'Customer', id, `Updated ${rows[0].fullName}`, user.shopId)

  return { success: true, data: rows[0] }
})
