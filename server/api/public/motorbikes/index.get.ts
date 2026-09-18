import { query, queryOne } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const pageSize = Math.min(48, Math.max(1, Number(q.pageSize) || 12))
  const search = ((q.search as string) || '').trim()
  const brand = (q.brand as string) || ''
  const categorySlug = (q.category as string) || ''
  const shopSlug = (q.shop as string) || ''
  const transmission = (q.transmission as string) || ''
  const minPrice = q.minPrice ? Number(q.minPrice) : undefined
  const maxPrice = q.maxPrice ? Number(q.maxPrice) : undefined
  const sort = (q.sort as string) || 'popular'

  const where: string[] = [`m.status = 'AVAILABLE'`, `s."isActive" = true`]
  const params: unknown[] = []

  if (search) {
    params.push(`%${search.toLowerCase()}%`)
    where.push(
      `(LOWER(m.name) LIKE $${params.length} OR LOWER(m.brand) LIKE $${params.length} OR LOWER(m.model) LIKE $${params.length})`
    )
  }
  if (brand) {
    params.push(brand)
    where.push(`m.brand = $${params.length}`)
  }
  if (categorySlug) {
    params.push(categorySlug)
    where.push(`c.slug = $${params.length}`)
  }
  if (shopSlug) {
    params.push(shopSlug)
    where.push(`s.slug = $${params.length}`)
  }
  if (transmission) {
    params.push(transmission)
    where.push(`m.transmission = $${params.length}`)
  }
  if (minPrice !== undefined) {
    params.push(minPrice)
    where.push(`m."dailyPrice" >= $${params.length}`)
  }
  if (maxPrice !== undefined) {
    params.push(maxPrice)
    where.push(`m."dailyPrice" <= $${params.length}`)
  }

  const whereSql = `WHERE ${where.join(' AND ')}`
  const orderSql =
    sort === 'price_asc'
      ? 'm."dailyPrice" ASC'
      : sort === 'price_desc'
        ? 'm."dailyPrice" DESC'
        : sort === 'newest'
          ? 'm."createdAt" DESC'
          : 'm.popular DESC, m.featured DESC, m."createdAt" DESC'

  const totalRow = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text as count FROM motorbikes m
     LEFT JOIN motorbike_categories c ON c.id = m."categoryId"
     JOIN shops s ON s.id = m."shopId"
     ${whereSql}`,
    params
  )
  const total = Number(totalRow?.count || 0)

  params.push(pageSize)
  params.push((page - 1) * pageSize)

  const rows = await query(
    `SELECT m.id, m.name, m.slug, m.brand, m.model, m."engineCc", m.transmission, m."dailyPrice",
            m."weeklyPrice", m."monthlyPrice", m.featured, m.popular, m."isNewBike", m."goodForCity", m."goodForLongTrip",
            c.name as "categoryName", c.slug as "categorySlug",
            s.id as "shopId", s.slug as "shopSlug", s.name as "shopName", s.address as "shopAddress", s.phone as "shopPhone", s."logoUrl" as "shopLogoUrl",
            (SELECT url FROM motorbike_images WHERE "motorbikeId" = m.id ORDER BY "isPrimary" DESC, "sortOrder" ASC LIMIT 1) as image
     FROM motorbikes m
     LEFT JOIN motorbike_categories c ON c.id = m."categoryId"
     JOIN shops s ON s.id = m."shopId"
     ${whereSql}
     ORDER BY ${orderSql}
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  )

  const brands = await query<{ brand: string }>(
    `SELECT DISTINCT brand FROM motorbikes WHERE status = 'AVAILABLE' ORDER BY brand ASC`
  )
  const categories = await query(`SELECT * FROM motorbike_categories ORDER BY name ASC`)

  return {
    success: true,
    data: {
      items: rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      filters: { brands: brands.map((b) => b.brand), categories }
    }
  }
})
