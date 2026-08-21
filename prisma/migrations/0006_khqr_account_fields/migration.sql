-- The business's real Bakong account details, used to generate a live
-- KHQR code (with the exact amount baked in) entirely offline via the
-- bakong-khqr package — no payment gateway account needed.
ALTER TABLE "business_settings" ADD COLUMN IF NOT EXISTS "khqrAccountId" TEXT;
ALTER TABLE "business_settings" ADD COLUMN IF NOT EXISTS "khqrMerchantName" TEXT;
ALTER TABLE "business_settings" ADD COLUMN IF NOT EXISTS "khqrMerchantCity" TEXT;
