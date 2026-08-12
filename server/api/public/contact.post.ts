import { z } from 'zod'
import { query, newId } from '../../utils/db'

const bodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  message: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Please fill in your name, email, and message' })
  }
  const d = parsed.data
  const id = newId()
  await query(
    `INSERT INTO contact_messages (id, name, email, phone, message, "createdAt") VALUES ($1,$2,$3,$4,$5, now())`,
    [id, d.name, d.email, d.phone || null, d.message]
  )
  return { success: true, data: { received: true } }
})
