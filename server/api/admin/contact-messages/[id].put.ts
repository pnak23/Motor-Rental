import { query } from '../../../utils/db'
import { requirePlatformAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event)
  const id = getRouterParam(event, 'id')
  const rows = await query(`UPDATE contact_messages SET "isRead" = true WHERE id = $1 RETURNING *`, [id])
  if (rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Message not found' })
  }
  return { success: true, data: rows[0] }
})
