import { query, queryOne } from '../../../utils/db'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(q.pageSize) || 20))
  const search = (q.search as string) || ''
  const status = (q.status as string) || ''
  const brand = (q.brand as string) || ''
  const sort = (q.sort as string) || 'newest'

  const where: string[] = []
  const params: unknown[] = []

  if (search) {
    params.push(`%${search.toLowerCase()}%`)
    where.push(
      `(LOWER(m.name) LIKE $${params.length} OR LOWER(m.brand) LIKE $${params.length} OR LOWER(m.model) LIKE $${params.length})`
    )
  }
  if (status) {
    params.push(status)
    where.push(`m.status = $${params.length}`)
  }
  if (brand) {
    params.push(brand)
    where.push(`m.brand = $${params.length}`)
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

  const orderSql =
    sort === 'price_asc'
      ? 'm."dailyPrice" ASC'
      : sort === 'price_desc'
        ? 'm."dailyPrice" DESC'
        : sort === 'name'
          ? 'm.name ASC'
          : 'm."createdAt" DESC'

  const totalRow = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text as count FROM motorbikes m ${whereSql}`,
    params
  )
  const total = Number(totalRow?.count || 0)

  params.push(pageSize)
  params.push((page - 1) * pageSize)

  const rows = await query(
    `SELECT m.*, c.name as "categoryName",
       (SELECT url FROM motorbike_images WHERE "motorbikeId" = m.id ORDER BY "isPrimary" DESC, "sortOrder" ASC LIMIT 1) as "primaryImage"
     FROM motorbikes m
     LEFT JOIN motorbike_categories c ON c.id = m."categoryId"
     ${whereSql}
     ORDER BY ${orderSql}
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  )

  return {
    success: true,
    data: { items: rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  }
})
