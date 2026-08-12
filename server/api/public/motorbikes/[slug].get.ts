import { queryOne, query } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  const motorbike = await queryOne(
    `SELECT m.*, c.name as "categoryName", c.slug as "categorySlug"
     FROM motorbikes m LEFT JOIN motorbike_categories c ON c.id = m."categoryId"
     WHERE m.slug = $1 AND m.status <> 'INACTIVE'`,
    [slug]
  )
  if (!motorbike) {
    throw createError({ statusCode: 404, statusMessage: 'Motorbike not found' })
  }

  const images = await query(
    `SELECT id, url, "isPrimary" FROM motorbike_images WHERE "motorbikeId" = $1 ORDER BY "isPrimary" DESC, "sortOrder" ASC`,
    [motorbike.id]
  )
  const pricingRules = await query(
    `SELECT name, "minDays", "maxDays", "pricePerDay" FROM pricing_rules
     WHERE "motorbikeId" = $1 AND active = true ORDER BY "minDays" ASC`,
    [motorbike.id]
  )

  // A handful of similar bikes (same category, excluding itself) to round out the page.
  const related = await query(
    `SELECT m.id, m.name, m.slug, m."dailyPrice",
       (SELECT url FROM motorbike_images WHERE "motorbikeId" = m.id ORDER BY "isPrimary" DESC LIMIT 1) as image
     FROM motorbikes m
     WHERE m."categoryId" = $1 AND m.id <> $2 AND m.status = 'AVAILABLE'
     LIMIT 4`,
    [motorbike.categoryId, motorbike.id]
  )

  return { success: true, data: { ...motorbike, images, pricingRules, related } }
})
