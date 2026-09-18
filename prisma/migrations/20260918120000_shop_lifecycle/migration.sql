-- Shop lifecycle status, used by the Platform Super Admin Shop Control Center.
-- `isActive` is kept and stays in sync (derived from `status`) so existing
-- public-facing queries that filter on it keep working unchanged.
ALTER TABLE "shops" ADD COLUMN "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
  CHECK ("status" IN ('ACTIVE','PENDING','SUSPENDED','CLOSED'));
ALTER TABLE "shops" ADD COLUMN "suspendedReason" TEXT;
ALTER TABLE "shops" ADD COLUMN "statusChangedAt" TIMESTAMP(3);

UPDATE "shops" SET "status" = CASE WHEN "isActive" THEN 'ACTIVE' ELSE 'SUSPENDED' END;
