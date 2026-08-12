import { query, queryOne } from '../../../../../../utils/db'
import { requireAuth } from '../../../../../../utils/auth'
import { logAudit } from '../../../../../../utils/audit'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event, ['SUPER_ADMIN', 'ADMIN'])
  const motorbikeId = getRouterParam(event, 'id')
  const imageId = getRouterParam(event, 'imageId')

  const image = await queryOne(`SELECT id FROM motorbike_images WHERE id = $1 AND "motorbikeId" = $2`, [
    imageId,
    motorbikeId
  ])
  if (!image) {
    throw createError({ statusCode: 404, statusMessage: 'Image not found' })
  }

  await query(`UPDATE motorbike_images SET "isPrimary" = false WHERE "motorbikeId" = $1`, [motorbikeId])
  await query(`UPDATE motorbike_images SET "isPrimary" = true WHERE id = $1`, [imageId])

  await logAudit(event, user.id, 'SET_PRIMARY_IMAGE', 'Motorbike', motorbikeId, `Set primary image ${imageId}`)

  return { success: true, data: null }
})
