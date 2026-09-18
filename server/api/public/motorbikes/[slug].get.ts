import { queryOne, query } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  const motorbike = await queryOne(
    `SELECT m.*, c.name as "categoryName", c.slug as "categorySlug",
            s.id as "shopId", s.slug as "shopSlug", s.name as "shopName", s.address as "shopAddress", s.province as "shopProvince", s.phone as "shopPhone", s."logoUrl" as "shopLogoUrl",
            s.telegram as "shopTelegram", s.whatsapp as "shopWhatsapp",
            s."khqrImageUrl" as "shopKhqrImageUrl", s."khqrInstructions" as "shopKhqrInstructions",
            s."abaInstructions" as "shopAbaInstructions", s."acledaInstructions" as "shopAcledaInstructions",
            s."wingInstructions" as "shopWingInstructions", s."cardInstructions" as "shopCardInstructions",
            (SELECT COUNT(*) FROM motorbikes WHERE "shopId" = s.id AND status = 'AVAILABLE')::int as "shopMotorbikeCount"
     FROM motorbikes m
     LEFT JOIN motorbike_categories c ON c.id = m."categoryId"
     JOIN shops s ON s.id = m."shopId"
     WHERE m.slug = $1 AND m.status <> 'INACTIVE' AND s."isActive" = true`,
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

  // A handful of similar bikes from the SAME shop (same category, excluding itself) —
  // never mixes in other shops' bikes, so the customer stays within the shop they're booking from.
  const related = await query(
    `SELECT m.id, m.name, m.slug, m."dailyPrice",
       (SELECT url FROM motorbike_images WHERE "motorbikeId" = m.id ORDER BY "isPrimary" DESC LIMIT 1) as image
     FROM motorbikes m
     WHERE m."categoryId" = $1 AND m.id <> $2 AND m."shopId" = $3 AND m.status = 'AVAILABLE'
     LIMIT 4`,
    [motorbike.categoryId, motorbike.id, motorbike.shopId]
  )

  return { success: true, data: { ...motorbike, images, pricingRules, related } }
})
