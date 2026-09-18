-- Two-party approval workflow for a Platform Super Admin accessing a shop's
-- dashboard: request -> shop Admin approve/deny -> enter (consumes approval).
CREATE TABLE "shop_access_requests" (
  "id" TEXT PRIMARY KEY,
  "shopId" TEXT NOT NULL,
  "requestedById" TEXT,
  "targetUserId" TEXT,
  "respondedById" TEXT,
  "reason" TEXT NOT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK ("status" IN ('PENDING','APPROVED','DENIED','EXPIRED','USED')),
  "responseNote" TEXT,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "respondedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3)
);

ALTER TABLE "shop_access_requests" ADD CONSTRAINT "shop_access_requests_shopId_fkey"
  FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "shop_access_requests" ADD CONSTRAINT "shop_access_requests_requestedById_fkey"
  FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "shop_access_requests" ADD CONSTRAINT "shop_access_requests_targetUserId_fkey"
  FOREIGN KEY ("targetUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "shop_access_requests" ADD CONSTRAINT "shop_access_requests_respondedById_fkey"
  FOREIGN KEY ("respondedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "shop_access_requests_shopId_idx" ON "shop_access_requests"("shopId");
CREATE INDEX "shop_access_requests_status_idx" ON "shop_access_requests"("status");
