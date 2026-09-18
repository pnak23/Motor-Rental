import { query, newId } from '../../../utils/db'
import { requireShopAdmin, hashPassword } from '../../../utils/auth'
import { userCreateSchema } from '../../../utils/schemas'
import { logAudit } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
  if (event.method === 'GET') {
    const user = await requireShopAdmin(event, ['ADMIN'])
    const rows = await query(
      `SELECT id, email, name, role, "isActive", "createdAt" FROM users WHERE "shopId" = $1 ORDER BY "createdAt" ASC`,
      [user.shopId]
    )
    return { success: true, data: rows }
  }

  const user = await requireShopAdmin(event, ['ADMIN'])
  const parsed = userCreateSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message || 'Invalid user data' })
  }
  const d = parsed.data

  const existing = await query(`SELECT id FROM users WHERE email = $1`, [d.email.toLowerCase()])
  if (existing.length > 0) {
    throw createError({ statusCode: 409, statusMessage: 'A user with this email already exists' })
  }

  const id = newId()
  const passwordHash = await hashPassword(d.password)
  const rows = await query(
    `INSERT INTO users (id, email, password, name, role, "isActive", "shopId", "createdAt", "updatedAt")
     VALUES ($1,$2,$3,$4,$5,true,$6, now(), now())
     RETURNING id, email, name, role, "isActive", "createdAt"`,
    [id, d.email.toLowerCase(), passwordHash, d.name, d.role, user.shopId]
  )

  await logAudit(event, user.id, 'CREATE_USER', 'User', id, `Created admin user ${d.email}`, user.shopId)

  return { success: true, data: rows[0] }
})
