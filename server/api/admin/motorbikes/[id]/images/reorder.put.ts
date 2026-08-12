import { z } from 'zod'
import { query } from '../../../../../utils/db'
import { requireAuth } from '../../../../../utils/auth'

const bodySchema = z.object({ imageIds: z.array(z.string()).min(1) })

export default defineEventHandler(async (event) => {
  await requireAuth(event, ['SUPER_ADMIN', 'ADMIN'])
  const motorbikeId = getRouterParam(event, 'id')
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
