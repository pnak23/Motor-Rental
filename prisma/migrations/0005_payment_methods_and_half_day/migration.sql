-- Cambodia payment methods (KHQR / ABA / ACLEDA / Wing / Card / Cash),
-- manual verification flow: customers/staff declare what they paid and how,
-- admins confirm against their own bank/KHQR dashboard. No live gateway.
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "paymentProofUrl" TEXT;

-- Business-configurable payment instructions shown to customers at booking time.
ALTER TABLE "business_settings" ADD COLUMN IF NOT EXISTS "khqrImageUrl" TEXT;
ALTER TABLE "business_settings" ADD COLUMN IF NOT EXISTS "khqrInstructions" TEXT;
ALTER TABLE "business_settings" ADD COLUMN IF NOT EXISTS "abaInstructions" TEXT;
ALTER TABLE "business_settings" ADD COLUMN IF NOT EXISTS "acledaInstructions" TEXT;
ALTER TABLE "business_settings" ADD COLUMN IF NOT EXISTS "wingInstructions" TEXT;
ALTER TABLE "business_settings" ADD COLUMN IF NOT EXISTS "cardInstructions" TEXT;
