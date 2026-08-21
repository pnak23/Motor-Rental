import { z } from 'zod'
import { queryOne } from '../../../utils/db'
import { generateKhqr, abaDeepLink } from '../../../utils/khqr'

const bodySchema = z.object({
  amount: z.coerce.number().positive(),
  reference: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'A valid amount is required' })
  }

  const settings = await queryOne<{
    khqrAccountId: string | null
    khqrMerchantName: string | null
    khqrMerchantCity: string | null
    businessName: string
  }>(`SELECT "khqrAccountId", "khqrMerchantName", "khqrMerchantCity", "businessName" FROM business_settings WHERE id = 'main'`)

  if (!settings?.khqrAccountId) {
    // Business hasn't configured a Bakong account yet — caller should fall
    // back to a static QR image / plain instructions instead.
    return { success: true, data: { available: false } }
  }

  const generated = await generateKhqr({
    bakongAccountId: settings.khqrAccountId,
    merchantName: settings.khqrMerchantName || settings.businessName || 'Angkor Wheels Rental',
    merchantCity: settings.khqrMerchantCity || 'Siem Reap',
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
