import { z } from 'zod'
import { query } from '../../../utils/db'
import { requireAuth, hashPassword } from '../../../utils/auth'
import { logAudit } from '../../../utils/audit'

const bodySchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'STAFF']).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional()
})

export default defineEventHandler(async (event) => {
  const authUser = await requireAuth(event, ['SUPER_ADMIN'])
  const id = getRouterParam(event, 'id')

  if (event.method === 'DELETE') {
    if (id === authUser.id) {
      throw createError({ statusCode: 400, statusMessage: 'You cannot delete your own account' })
    }
    await query(`DELETE FROM users WHERE id = $1`, [id])
    await logAudit(event, authUser.id, 'DELETE_USER', 'User', id, 'Deleted admin user')
    return { success: true, data: null }
  }

  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid user update' })
  }
  const d = parsed.data

  const fields: string[] = []
  const params: unknown[] = []
  if (d.name !== undefined) {
    params.push(d.name)
    fields.push(`name = $${params.length}`)
  }
  if (d.role !== undefined) {
    params.push(d.role)
    fields.push(`role = $${params.length}`)
  }
  if (d.isActive !== undefined) {
    params.push(d.isActive)
    fields.push(`"isActive" = $${params.length}`)
  }
  if (d.password) {
    params.push(await hashPassword(d.password))
    fields.push(`password = $${params.length}`)
  }
  if (fields.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No fields to update' })
  }
  fields.push(`"updatedAt" = now()`)
  params.push(id)

  const rows = await query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING id, email, name, role, "isActive"`,
    params
  )
  if (rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  await logAudit(event, authUser.id, 'UPDATE_USER', 'User', id, `Updated user ${rows[0].email}`)

  return { success: true, data: rows[0] }
})
