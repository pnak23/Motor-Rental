import { query } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const search = ((q.search as string) || '').trim()
  const province = ((q.province as string) || '').trim()

  const where: string[] = [`s."isActive" = true`]
  const params: unknown[] = []

  if (search) {
    params.push(`%${search.toLowerCase()}%`)
    where.push(`LOWER(s.name) LIKE $${params.length}`)
  }
  if (province) {
    params.push(province)
    where.push(`s.province = $${params.length}`)
  }

  const rows = await query(
    `SELECT s.id, s.slug, s.name, s."logoUrl", s.address, s.province, s.phone, s.email,
            s."minimumAge", s."requiredDocuments",
            s."depositPolicy", s."fuelPolicy", s."lateReturnPolicy", s."damagePolicy",
            s."cancellationPolicy", s."accidentPolicy", s."trafficViolationPolicy", s."helmetPolicy",
            (SELECT COUNT(*) FROM motorbikes m WHERE m."shopId" = s.id AND m.status = 'AVAILABLE')::int as "motorbikeCount"
     FROM shops s
     WHERE ${where.join(' AND ')}
     ORDER BY s.name ASC`,
    params
  )

  return { success: true, data: rows }
})
