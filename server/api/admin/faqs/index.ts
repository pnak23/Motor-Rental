import { query, newId } from '../../../utils/db'
import { requirePlatformAdmin } from '../../../utils/auth'
import { faqSchema } from '../../../utils/schemas'

export default defineEventHandler(async (event) => {
  if (event.method === 'GET') {
    await requirePlatformAdmin(event)
    const rows = await query(`SELECT * FROM faqs ORDER BY "sortOrder" ASC, "createdAt" ASC`)
    return { success: true, data: rows }
  }

  await requirePlatformAdmin(event)
  const parsed = faqSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Question and answer are required' })
  }
  const d = parsed.data
  const id = newId()
  const rows = await query(
    `INSERT INTO faqs (id, question, answer, "sortOrder", "isActive", "createdAt") VALUES ($1,$2,$3,$4,$5, now()) RETURNING *`,
    [id, d.question, d.answer, d.sortOrder, d.isActive]
  )
  return { success: true, data: rows[0] }
})
