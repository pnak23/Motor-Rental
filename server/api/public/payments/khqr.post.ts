import { z } from 'zod'
import { queryOne } from '../../../utils/db'
import { generateKhqr, abaDeepLink } from '../../../utils/khqr'
import { enforceRateLimit } from '../../../utils/rateLimit'

const bodySchema = z.object({
  motorbikeId: z.string().min(1),
  amount: z.coerce.number().positive(),
  reference: z.string().optional()
})

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'khqr', { max: 30, windowMs: 5 * 60 * 1000 })

  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'A valid amount is required' })
  }

  const motorbike = await queryOne<{ shopId: string }>(`SELECT "shopId" FROM motorbikes WHERE id = $1`, [parsed.data.motorbikeId])
  if (!motorbike) {
    throw createError({ statusCode: 404, statusMessage: 'Motorbike not found' })
  }

  // KHQR account details are configured per-shop — each shop is paid into
  // its own Bakong account, never a shared/default one.
  const shop = await queryOne<{
    khqrAccountId: string | null
    khqrMerchantName: string | null
    khqrMerchantCity: string | null
    name: string
  }>(`SELECT "khqrAccountId", "khqrMerchantName", "khqrMerchantCity", name FROM shops WHERE id = $1`, [motorbike.shopId])

  if (!shop?.khqrAccountId) {
    // This shop hasn't configured a Bakong account yet — caller should fall
    // back to a static QR image / plain instructions instead.
    return { success: true, data: { available: false } }
  }

  const generated = await generateKhqr({
    bakongAccountId: shop.khqrAccountId,
    merchantName: shop.khqrMerchantName || shop.name || 'RideNow',
    merchantCity: shop.khqrMerchantCity || 'Siem Reap',
    amount: parsed.data.amount,
    billNumber: parsed.data.reference
  })

  return {
    success: true,
    data: {
      available: true,
      qrImage: generated.qrImageDataUrl,
      abaDeepLink: abaDeepLink(generated.qrString)
    }
  }
})
