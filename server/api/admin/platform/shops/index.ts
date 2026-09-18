import { query, queryOne, newId, withTransaction } from '../../../../utils/db'
import { requirePlatformAdmin, hashPassword } from '../../../../utils/auth'
import { shopCreateSchema } from '../../../../utils/schemas'
import { logAudit } from '../../../../utils/audit'
import { slugify } from '../../../../utils/response'

const SHOP_DATA_CTE = `
  WITH shop_data AS (
    SELECT s.*,
      (SELECT u.name FROM users u WHERE u."shopId" = s.id ORDER BY u."createdAt" ASC LIMIT 1) as "ownerName",
      (SELECT u.email FROM users u WHERE u."shopId" = s.id ORDER BY u."createdAt" ASC LIMIT 1) as "ownerEmail",
      (SELECT COUNT(*) FROM users u WHERE u."shopId" = s.id)::int as "userCount",
      (SELECT COUNT(*) FROM bookings b WHERE b."shopId" = s.id)::int as "bookingCount",
      (SELECT MAX(a."createdAt") FROM audit_logs a WHERE a."shopId" = s.id) as "lastActivity"
    FROM shops s
  )
`

export default defineEventHandler(async (event) => {
  if (event.method === 'GET') {
    await requirePlatformAdmin(event)
    const q = getQuery(event)
    const search = ((q.search as string) || '').trim()
    const status = (q.status as string) || ''
    const sort = (q.sort as string) || 'createdAt'
    const page = Math.max(1, Number(q.page) || 1)
    const pageSize = Math.min(100, Math.max(1, Number(q.pageSize) || 20))

    const where: string[] = []
    const params: unknown[] = []
    if (search) {
      params.push(`%${search.toLowerCase()}%`)
      where.push(`(LOWER(name) LIKE $${params.length} OR LOWER(slug) LIKE $${params.length} OR LOWER("ownerEmail") LIKE $${params.length})`)
    }
    if (status) {
      params.push(status)
      where.push(`status = $${params.length}`)
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
    const orderSql =
      sort === 'name'
        ? '"name" ASC'
        : sort === 'lastActivity'
          ? '"lastActivity" DESC NULLS LAST'
          : '"createdAt" DESC'

    const totalRow = await queryOne<{ count: string }>(`${SHOP_DATA_CTE} SELECT COUNT(*)::text as count FROM shop_data ${whereSql}`, params)
    const total = Number(totalRow?.count || 0)

    const rows = await query(
      `${SHOP_DATA_CTE} SELECT * FROM shop_data ${whereSql} ORDER BY ${orderSql} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, (page - 1) * pageSize]
    )

    return { success: true, data: { items: rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } }
  }

  const user = await requirePlatformAdmin(event)
  const parsed = shopCreateSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message || 'Invalid shop data' })
  }
  const d = parsed.data

  const existing = await query(`SELECT id FROM users WHERE email = $1`, [d.ownerEmail.toLowerCase()])
  if (existing.length > 0) {
    throw createError({ statusCode: 409, statusMessage: 'A user with this email already exists' })
  }

  const baseSlug = slugify(d.slug || d.name)
  let slug = baseSlug
  let suffix = 1
  while (true) {
    const existingShop = await query(`SELECT id FROM shops WHERE slug = $1`, [slug])
    if (existingShop.length === 0) break
    suffix += 1
    slug = `${baseSlug}-${suffix}`
  }

  const shopId = newId()
  const shop = await withTransaction(async (client) => {
    const shopRes = await client.query(
      `INSERT INTO shops (id, slug, name, phone, email, address, province, "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7, now(), now()) RETURNING *`,
      [shopId, slug, d.name, d.phone ?? null, d.email ?? null, d.address ?? null, d.province ?? null]
    )

    const ownerId = newId()
    const passwordHash = await hashPassword(d.ownerPassword)
    await client.query(
      `INSERT INTO users (id, email, password, name, role, "isActive", "shopId", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,'ADMIN',true,$5, now(), now())`,
      [ownerId, d.ownerEmail.toLowerCase(), passwordHash, d.ownerName, shopId]
    )

    return shopRes.rows[0]
  })

  await logAudit(event, user.id, 'CREATE_SHOP', 'Shop', shopId, `Created shop ${d.name} with owner ${d.ownerEmail}`)

  return { success: true, data: shop }
})
