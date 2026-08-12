import { query } from '../../../utils/db'
import { requireAuth } from '../../../utils/auth'
import { settingsSchema } from '../../../utils/schemas'
import { logAudit } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event, ['SUPER_ADMIN', 'ADMIN'])
  const parsed = settingsSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message || 'Invalid settings' })
  }

  const fields: string[] = []
  const params: unknown[] = []
  for (const [key, value] of Object.entries(parsed.data)) {
    params.push(value)
    fields.push(`"${key}" = $${params.length}`)
  }
  fields.push(`"updatedAt" = now()`)

  await query(`INSERT INTO business_settings (id) VALUES ('main') ON CONFLICT (id) DO NOTHING`)
  const rows = await query(`UPDATE business_settings SET ${fields.join(', ')} WHERE id = 'main' RETURNING *`, params)

  await logAudit(event, user.id, 'UPDATE_SETTINGS', 'BusinessSetting', 'main', 'Updated business settings')

  return { success: true, data: rows[0] }
})
