import { query } from '../../../utils/db'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event, ['SUPER_ADMIN', 'ADMIN'])
  const id = getRouterParam(event, 'id')

  if (event.method === 'DELETE') {
    await query(`DELETE FROM pricing_rules WHERE id = $1`, [id])
    return { success: true, data: null }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
