import { query, newId } from '../../../../../../utils/db'
import { requirePlatformAdmin, hashPassword } from '../../../../../../utils/auth'
import { userCreateSchema } from '../../../../../../utils/schemas'
import { logAudit } from '../../../../../../utils/audit'

export default defineEventHandler(async (event) => {
  const shopId = getRouterParam(event, 'id') as string

  if (event.method === 'GET') {
    await requirePlatformAdmin(event)
    const rows = await query(
      `SELECT id, email, name, role, "isActive", "createdAt" FROM users WHERE "shopId" = $1 ORDER BY "createdAt" ASC`,
      [shopId]
    )
    return { success: true, data: rows }
  }

  const admin = await requirePlatformAdmin(event)
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
    [id, d.email.toLowerCase(), passwordHash, d.name, d.role, shopId]
  )

  await logAudit(event, admin.id, 'CREATE_USER', 'User', id, `Created admin user ${d.email}`, shopId)

  return { success: true, data: rows[0] }
})
