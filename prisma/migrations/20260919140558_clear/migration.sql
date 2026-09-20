-- AlterTable
ALTER TABLE "business_settings" ALTER COLUMN "businessName" SET DEFAULT 'RideNow';

-- AlterTable
ALTER TABLE "shop_access_requests" ALTER COLUMN "status" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "shops" ALTER COLUMN "status" SET DATA TYPE TEXT;
