import { queryOne } from '../../../utils/db'
import { requirePlatformAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event)
  let settings = await queryOne(`SELECT * FROM business_settings WHERE id = 'main'`)
  if (!settings) {
    settings = await queryOne(`INSERT INTO business_settings (id) VALUES ('main') RETURNING *`)
  }
  return { success: true, data: settings }
})
