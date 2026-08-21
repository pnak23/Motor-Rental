import { motorbikeSchema } from '../../../utils/schemas'
import { query, newId } from '../../../utils/db'
import { requireAuth } from '../../../utils/auth'
import { logAudit } from '../../../utils/audit'
import { slugify } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event, ['SUPER_ADMIN', 'ADMIN'])
  const parsed = motorbikeSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message || 'Invalid motorbike data' })
  }
  const d = parsed.data
  const baseSlug = slugify(d.slug || `${d.brand}-${d.name}-${d.engineCc}`)

  // Ensure slug uniqueness
  let slug = baseSlug
  let suffix = 1
  while (true) {
    const existing = await query(`SELECT id FROM motorbikes WHERE slug = $1`, [slug])
    if (existing.length === 0) break
    suffix += 1
    slug = `${baseSlug}-${suffix}`
  }

  const id = newId()
  const rows = await query(
    `INSERT INTO motorbikes (
      id, name, slug, brand, model, year, "engineCc", "plateNumber", color, "keyType",
      "categoryId", transmission, "fuelType", "seatCapacity", "fuelConsumption",
      description, status, featured, "helmetIncluded", "phoneHolder", "usbCharger",
      "goodForCity", "goodForLongTrip", "isNewBike", popular,
      "dailyPrice", "weeklyPrice", "monthlyPrice", deposit, "deliveryFee",
      "minRentalDays", "maxRentalDays", "seoTitle", "seoDescription", "seoKeywords",
      "createdAt", "updatedAt"
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
      $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35, now(), now()
    ) RETURNING *`,
    [
      id, d.name, slug, d.brand, d.model, d.year ?? null, d.engineCc, d.plateNumber ?? null, d.color ?? null, d.keyType,
      d.categoryId ?? null, d.transmission, d.fuelType, d.seatCapacity ?? null, d.fuelConsumption ?? null,
      d.description ?? null, d.status, d.featured, d.helmetIncluded, d.phoneHolder, d.usbCharger,
      d.goodForCity, d.goodForLongTrip, d.isNewBike, d.popular,
      d.dailyPrice, d.weeklyPrice ?? null, d.monthlyPrice ?? null, d.deposit, d.deliveryFee,
      d.minRentalDays, d.maxRentalDays, d.seoTitle ?? null, d.seoDescription ?? null, d.seoKeywords ?? null
    ]
  )

  await logAudit(event, user.id, 'CREATE_MOTORBIKE', 'Motorbike', id, `Created ${d.name}`)

  return { success: true, data: rows[0] }
})
