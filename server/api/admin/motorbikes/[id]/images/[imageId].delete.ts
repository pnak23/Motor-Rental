import { unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { query, queryOne, newId } from '../../../../../utils/db'
import { requireAuth } from '../../../../../utils/auth'
import { logAudit } from '../../../../../utils/audit'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event, ['SUPER_ADMIN', 'ADMIN'])
  const motorbikeId = getRouterParam(event, 'id')
  const imageId = getRouterParam(event, 'imageId')

  const image = await queryOne<{ filename: string; isPrimary: boolean }>(
    `SELECT filename, "isPrimary" FROM motorbike_images WHERE id = $1 AND "motorbikeId" = $2`,
    [imageId, motorbikeId]
  )
  if (!image) {
    throw createError({ statusCode: 404, statusMessage: 'Image not found' })
  }

  await query(`DELETE FROM motorbike_images WHERE id = $1`, [imageId])

  // Best-effort file cleanup; a failure here shouldn't fail the request.
  try {
    const dir = join(process.cwd(), 'public', 'uploads', 'motorbikes')
    await unlink(join(dir, image.filename))
    await unlink(join(dir, image.filename.replace(/\.webp$/, '-thumb.webp')))
  } catch {
    // ignore
  }

  // If we removed the primary image, promote the next one in order.
  if (image.isPrimary) {
    const next = await queryOne<{ id: string }>(
      `SELECT id FROM motorbike_images WHERE "motorbikeId" = $1 ORDER BY "sortOrder" ASC LIMIT 1`,
      [motorbikeId]
    )
    if (next) {
      await query(`UPDATE motorbike_images SET "isPrimary" = true WHERE id = $1`, [next.id])
    }
  }

  await logAudit(event, user.id, 'DELETE_MOTORBIKE_IMAGE', 'Motorbike', motorbikeId ?? newId(), `Deleted image ${imageId}`)

  return { success: true, data: null }
})
