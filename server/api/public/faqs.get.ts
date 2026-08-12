import { query } from '../../utils/db'

export default defineEventHandler(async () => {
  const rows = await query(
    `SELECT id, question, answer FROM faqs WHERE "isActive" = true ORDER BY "sortOrder" ASC, "createdAt" ASC`
  )
  return { success: true, data: rows }
})
