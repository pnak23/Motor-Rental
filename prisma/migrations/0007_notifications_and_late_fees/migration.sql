-- Late-return / deposit-refund tracking on bookings
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "actualReturnAt" TIMESTAMP(3);
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "lateFeeAmount" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "depositRefundedAmount" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "depositRefundedAt" TIMESTAMP(3);

-- Dedup markers so the reminder job never emails the same booking twice
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "pickupReminderSentAt" TIMESTAMP(3);
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "returnReminderSentAt" TIMESTAMP(3);

-- Notification / late-fee configuration
ALTER TABLE "business_settings" ADD COLUMN IF NOT EXISTS "emailNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "business_settings" ADD COLUMN IF NOT EXISTS "lateFeePerHour" DECIMAL(10,2) NOT NULL DEFAULT 0;
