import { query } from '../../utils/db'

export default defineEventHandler(async () => {
  const rows = await query(`SELECT * FROM locations WHERE "isActive" = true ORDER BY "sortOrder" ASC, name ASC`)
  return { success: true, data: rows }
})
