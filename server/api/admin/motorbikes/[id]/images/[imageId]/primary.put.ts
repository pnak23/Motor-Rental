import { query, queryOne } from '../../../../../../utils/db'
import { requireShopAdmin } from '../../../../../../utils/auth'
import { logAudit } from '../../../../../../utils/audit'

export default defineEventHandler(async (event) => {
  const user = await requireShopAdmin(event, ['SUPER_ADMIN', 'ADMIN'])
  const motorbikeId = getRouterParam(event, 'id')
  const imageId = getRouterParam(event, 'imageId')

  const motorbike = await queryOne(`SELECT id FROM motorbikes WHERE id = $1 AND "shopId" = $2`, [motorbikeId, user.shopId])
  if (!motorbike) {
    throw createError({ statusCode: 404, statusMessage: 'Motorbike not found' })
  }

  const image = await queryOne(`SELECT id FROM motorbike_images WHERE id = $1 AND "motorbikeId" = $2`, [
    imageId,
    motorbikeId
  ])
  if (!image) {
    throw createError({ statusCode: 404, statusMessage: 'Image not found' })
  }

  await query(`UPDATE motorbike_images SET "isPrimary" = false WHERE "motorbikeId" = $1`, [motorbikeId])
  await query(`UPDATE motorbike_images SET "isPrimary" = true WHERE id = $1`, [imageId])

  await logAudit(event, user.id, 'SET_PRIMARY_IMAGE', 'Motorbike', motorbikeId, `Set primary image ${imageId}`, user.shopId)

  return { success: true, data: null }
})
