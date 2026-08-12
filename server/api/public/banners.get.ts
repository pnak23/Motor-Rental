import { query } from '../../utils/db'

export default defineEventHandler(async () => {
  const rows = await query(
    `SELECT id, title, subtitle, "imageUrl", "buttonText", "buttonUrl" FROM banners
     WHERE "isActive" = true
       AND (("startDate" IS NULL OR "startDate" <= now()) AND ("endDate" IS NULL OR "endDate" >= now()))
     ORDER BY "sortOrder" ASC`
  )
  return { success: true, data: rows }
})
