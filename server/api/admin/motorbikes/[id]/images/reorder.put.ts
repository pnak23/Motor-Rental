import { z } from 'zod'
import { query, queryOne } from '../../../../../utils/db'
import { requireShopAdmin } from '../../../../../utils/auth'

const bodySchema = z.object({ imageIds: z.array(z.string()).min(1) })

export default defineEventHandler(async (event) => {
  const user = await requireShopAdmin(event, ['SUPER_ADMIN', 'ADMIN'])
  const motorbikeId = getRouterParam(event, 'id')

  const motorbike = await queryOne(`SELECT id FROM motorbikes WHERE id = $1 AND "shopId" = $2`, [motorbikeId, user.shopId])
  if (!motorbike) {
    throw createError({ statusCode: 404, statusMessage: 'Motorbike not found' })
  }

  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'imageIds array is required' })
  }

  await Promise.all(
    parsed.data.imageIds.map((imgId, index) =>
      query(`UPDATE motorbike_images SET "sortOrder" = $1 WHERE id = $2 AND "motorbikeId" = $3`, [
        index,
        imgId,
        motorbikeId
      ])
    )
  )

  return { success: true, data: null }
})
