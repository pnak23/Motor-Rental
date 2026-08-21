// @ts-expect-error - bakong-khqr ships JS with a community .d.ts that doesn't
// match its actual (positional-constructor) API; we use the real runtime API
// documented in its README/tests and treat it as untyped here.
import { BakongKHQR, IndividualInfo, khqrData } from 'bakong-khqr'
import QRCode from 'qrcode'

export interface GeneratedKhqr {
  /** The raw EMV KHQR payload — what a banking app actually scans. */
  qrString: string
  /** Ready-to-render <img> data URL of the QR code. */
  qrImageDataUrl: string
}

/**
 * Generates a real, spec-compliant KHQR code (Cambodia's National Bank
 * standard) with the exact amount baked in, entirely offline — no payment
 * gateway account or API key required, just the business's own Bakong
 * account ID. Any Cambodian banking app (ABA, ACLEDA, Wing, ...) can scan it.
 */
export async function generateKhqr(opts: {
  bakongAccountId: string
  merchantName: string
  merchantCity: string
  amount: number
  billNumber?: string
}): Promise<GeneratedKhqr> {
  const info = new IndividualInfo(opts.bakongAccountId, opts.merchantName, opts.merchantCity || 'Siem Reap', {
    currency: khqrData.currency.usd,
    amount: Math.round(opts.amount * 100) / 100,
    billNumber: opts.billNumber || undefined,
    // Dynamic (amount-bearing) KHQR codes require an expiry; 15 minutes
    // comfortably covers a customer filling out the rest of the form.
    expirationTimestamp: Date.now() + 15 * 60 * 1000
  })

  const khqr = new BakongKHQR()
  const response = khqr.generateIndividual(info)
  if (response?.status?.errorCode) {
    throw createError({ statusCode: 500, statusMessage: response.status.message || 'Could not generate KHQR code' })
  }

  const qrString: string = response.data.qr
  const qrImageDataUrl = await QRCode.toDataURL(qrString, { margin: 1, width: 320 })
  return { qrString, qrImageDataUrl }
}

/**
 * ABA Mobile registers this custom URI scheme (documented in PayWay's QR
 * API) to open the app directly with a KHQR payload. Best-effort: PayWay's
 * docs describe it in the context of PayWay-issued links, so this may not
 * work identically with a self-generated KHQR string on every ABA Mobile
 * version — it degrades harmlessly (the link just does nothing) if not.
 */
export function abaDeepLink(qrString: string): string {
  return `abamobilebank://ababank.com?type=payway&qrcode=${encodeURIComponent(qrString)}`
}
