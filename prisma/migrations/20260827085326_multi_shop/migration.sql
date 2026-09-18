/*
  Warnings:

  - You are about to drop the column `abaInstructions` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `accidentPolicy` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `acledaInstructions` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `cancellationPolicy` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `cardInstructions` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `damagePolicy` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `depositPolicy` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `fuelPolicy` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `helmetPolicy` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `khqrAccountId` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `khqrImageUrl` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `khqrInstructions` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `khqrMerchantCity` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `khqrMerchantName` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `lateFeePerHour` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `lateReturnPolicy` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `maxRentalDays` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `minRentalDays` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `minimumAge` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `requiredDocuments` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `telegram` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `trafficViolationPolicy` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `whatsapp` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `wingInstructions` on the `business_settings` table. All the data in the column will be lost.
  - Added the required column `shopId` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopId` to the `locations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopId` to the `motorbikes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "booking_status_history" DROP CONSTRAINT "booking_status_history_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "booking_status_history" DROP CONSTRAINT "booking_status_history_changedById_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_customerId_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_motorbikeId_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_pickupLocationId_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_returnLocationId_fkey";

-- DropForeignKey
ALTER TABLE "maintenance_records" DROP CONSTRAINT "maintenance_records_motorbikeId_fkey";

-- DropForeignKey
ALTER TABLE "motorbike_images" DROP CONSTRAINT "motorbike_images_motorbikeId_fkey";

-- DropForeignKey
ALTER TABLE "motorbikes" DROP CONSTRAINT "motorbikes_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "password_reset_tokens_userId_fkey";

-- DropForeignKey
ALTER TABLE "pricing_rules" DROP CONSTRAINT "pricing_rules_motorbikeId_fkey";

-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "shopId" TEXT,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "banners" ALTER COLUMN "startDate" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "endDate" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "booking_status_history" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "shopId" TEXT NOT NULL,
ALTER COLUMN "pickupDate" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "returnDate" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "paidAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "business_settings" DROP COLUMN "abaInstructions",
DROP COLUMN "accidentPolicy",
DROP COLUMN "acledaInstructions",
DROP COLUMN "address",
DROP COLUMN "cancellationPolicy",
DROP COLUMN "cardInstructions",
DROP COLUMN "damagePolicy",
DROP COLUMN "depositPolicy",
DROP COLUMN "email",
DROP COLUMN "fuelPolicy",
DROP COLUMN "helmetPolicy",
DROP COLUMN "khqrAccountId",
DROP COLUMN "khqrImageUrl",
DROP COLUMN "khqrInstructions",
DROP COLUMN "khqrMerchantCity",
DROP COLUMN "khqrMerchantName",
DROP COLUMN "lateFeePerHour",
DROP COLUMN "lateReturnPolicy",
DROP COLUMN "maxRentalDays",
DROP COLUMN "minRentalDays",
DROP COLUMN "minimumAge",
DROP COLUMN "phone",
DROP COLUMN "requiredDocuments",
DROP COLUMN "telegram",
DROP COLUMN "trafficViolationPolicy",
DROP COLUMN "whatsapp",
DROP COLUMN "wingInstructions",
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "contact_messages" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "customers" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "faqs" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "locations" ADD COLUMN     "shopId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "maintenance_records" ALTER COLUMN "date" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "motorbike_images" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "motorbikes" ADD COLUMN     "shopId" TEXT NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "pricing_rules" ALTER COLUMN "startDate" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "endDate" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "shopId" TEXT,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- CreateTable
CREATE TABLE "shops" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "telegram" TEXT,
    "whatsapp" TEXT,
    "khqrAccountId" TEXT,
    "khqrMerchantName" TEXT,
    "khqrMerchantCity" TEXT,
    "khqrImageUrl" TEXT,
    "khqrInstructions" TEXT,
    "abaInstructions" TEXT,
    "acledaInstructions" TEXT,
    "wingInstructions" TEXT,
    "cardInstructions" TEXT,
    "lateFeePerHour" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "minRentalDays" INTEGER NOT NULL DEFAULT 1,
    "maxRentalDays" INTEGER NOT NULL DEFAULT 60,
    "depositPolicy" TEXT,
    "fuelPolicy" TEXT,
    "lateReturnPolicy" TEXT,
    "damagePolicy" TEXT,
    "cancellationPolicy" TEXT,
    "accidentPolicy" TEXT,
    "trafficViolationPolicy" TEXT,
    "helmetPolicy" TEXT,
    "minimumAge" INTEGER DEFAULT 18,
    "requiredDocuments" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shops_slug_key" ON "shops"("slug");

-- CreateIndex
CREATE INDEX "audit_logs_shopId_idx" ON "audit_logs"("shopId");

-- CreateIndex
CREATE INDEX "bookings_shopId_idx" ON "bookings"("shopId");

-- CreateIndex
CREATE INDEX "locations_shopId_idx" ON "locations"("shopId");

-- CreateIndex
CREATE INDEX "motorbikes_shopId_idx" ON "motorbikes"("shopId");

-- CreateIndex
CREATE INDEX "users_shopId_idx" ON "users"("shopId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motorbikes" ADD CONSTRAINT "motorbikes_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motorbikes" ADD CONSTRAINT "motorbikes_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "motorbike_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motorbike_images" ADD CONSTRAINT "motorbike_images_motorbikeId_fkey" FOREIGN KEY ("motorbikeId") REFERENCES "motorbikes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_rules" ADD CONSTRAINT "pricing_rules_motorbikeId_fkey" FOREIGN KEY ("motorbikeId") REFERENCES "motorbikes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_motorbikeId_fkey" FOREIGN KEY ("motorbikeId") REFERENCES "motorbikes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_pickupLocationId_fkey" FOREIGN KEY ("pickupLocationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_returnLocationId_fkey" FOREIGN KEY ("returnLocationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_status_history" ADD CONSTRAINT "booking_status_history_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_status_history" ADD CONSTRAINT "booking_status_history_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_motorbikeId_fkey" FOREIGN KEY ("motorbikeId") REFERENCES "motorbikes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE SET NULL ON UPDATE CASCADE;
