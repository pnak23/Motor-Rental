import { query, queryOne, newId } from '../../../../utils/db'
import { requireShopAdmin } from '../../../../utils/auth'
import { saveMotorbikeImage } from '../../../../utils/upload'
import { logAudit } from '../../../../utils/audit'

export default defineEventHandler(async (event) => {
  const user = await requireShopAdmin(event, ['SUPER_ADMIN', 'ADMIN'])
  const motorbikeId = getRouterParam(event, 'id')

  const motorbike = await queryOne(`SELECT id FROM motorbikes WHERE id = $1 AND "shopId" = $2`, [motorbikeId, user.shopId])
  if (!motorbike) {
    throw createError({ statusCode: 404, statusMessage: 'Motorbike not found' })
  }

  const files = await readMultipartFormData(event)
  if (!files || files.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No image files were uploaded' })
  }

  const existingCount = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text as count FROM motorbike_images WHERE "motorbikeId" = $1`,
    [motorbikeId]
  )
  let nextOrder = Number(existingCount?.count || 0)
  const hasPrimaryAlready = nextOrder > 0

  const saved = []
  for (const file of files) {
    if (!file.type || !file.filename) continue
    const image = await saveMotorbikeImage(file.data, file.type)
    const id = newId()
    const isPrimary = !hasPrimaryAlready && nextOrder === 0
    const rows = await query(
      `INSERT INTO motorbike_images (id, "motorbikeId", url, filename, size, "mimeType", "isPrimary", "sortOrder", "createdAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8, now()) RETURNING *`,
      [id, motorbikeId, image.url, image.filename, image.size, image.mimeType, isPrimary, nextOrder]
    )
    saved.push(rows[0])
    nextOrder += 1
  }

  await logAudit(event, user.id, 'UPLOAD_MOTORBIKE_IMAGE', 'Motorbike', motorbikeId, `Uploaded ${saved.length} image(s)`, user.shopId)

  return { success: true, data: saved }
})
