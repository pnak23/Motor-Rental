import { query, newId } from '../../../utils/db'
import { requirePlatformAdmin } from '../../../utils/auth'
import { bannerSchema } from '../../../utils/schemas'

export default defineEventHandler(async (event) => {
  if (event.method === 'GET') {
    await requirePlatformAdmin(event)
    const rows = await query(`SELECT * FROM banners ORDER BY "sortOrder" ASC, "createdAt" DESC`)
    return { success: true, data: rows }
  }

  await requirePlatformAdmin(event)
  const parsed = bannerSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message || 'Invalid banner' })
  }
  const d = parsed.data
  const id = newId()
  const rows = await query(
    `INSERT INTO banners (id, title, subtitle, "imageUrl", "buttonText", "buttonUrl", "startDate", "endDate", "isActive", "sortOrder", "createdAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now()) RETURNING *`,
    [id, d.title, d.subtitle ?? null, d.imageUrl, d.buttonText ?? null, d.buttonUrl ?? null, d.startDate ?? null, d.endDate ?? null, d.isActive, d.sortOrder]
  )
  return { success: true, data: rows[0] }
})
