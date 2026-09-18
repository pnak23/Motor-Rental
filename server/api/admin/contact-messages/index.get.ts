import { query } from '../../../utils/db'
import { requirePlatformAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event)
  const rows = await query(`SELECT * FROM contact_messages ORDER BY "createdAt" DESC`)
  return { success: true, data: rows }
})
