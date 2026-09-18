import { query } from '../../../../utils/db'
import { requirePlatformAdmin } from '../../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event)

  const rows = await query(
    `SELECT u.id, u.email, u.name, u.role, u."isActive", u."createdAt", u."shopId", s.name as "shopName"
     FROM users u
     LEFT JOIN shops s ON s.id = u."shopId"
     ORDER BY u."createdAt" ASC`
  )

  return { success: true, data: rows }
})
