import { queryOne } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  const shop = await queryOne(
    `SELECT s.id, s.slug, s.name, s."logoUrl", s.address, s.province, s.phone, s.email, s.telegram, s.whatsapp,
            s."minRentalDays", s."maxRentalDays", s."minimumAge", s."requiredDocuments",
            s."depositPolicy", s."fuelPolicy", s."lateReturnPolicy", s."damagePolicy",
            s."cancellationPolicy", s."accidentPolicy", s."trafficViolationPolicy", s."helmetPolicy",
            (SELECT COUNT(*) FROM motorbikes m WHERE m."shopId" = s.id AND m.status = 'AVAILABLE')::int as "motorbikeCount"
     FROM shops s
     WHERE s.slug = $1 AND s."isActive" = true`,
    [slug]
  )

  if (!shop) {
    throw createError({ statusCode: 404, statusMessage: 'Shop not found' })
  }

  return { success: true, data: shop }
})
