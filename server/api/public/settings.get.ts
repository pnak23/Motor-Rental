import { queryOne } from '../../utils/db'

export default defineEventHandler(async () => {
  const settings = await queryOne(`SELECT * FROM business_settings WHERE id = 'main'`)
  return { success: true, data: settings }
})
