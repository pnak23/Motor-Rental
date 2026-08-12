import { query } from '../../../utils/db'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const rows = await query(`SELECT * FROM contact_messages ORDER BY "createdAt" DESC`)
  return { success: true, data: rows }
})
