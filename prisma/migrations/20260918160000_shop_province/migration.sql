-- Which Cambodian province/city a shop physically operates out of, so the
-- public marketplace can filter shops/motorbikes by location now that the
-- platform is expanding beyond Siem Reap. Free text (not a CHECK-constrained
-- enum) validated only at the UI layer via app/utils/cambodiaProvinces.ts,
-- the same convention already used for "address"/"phone" on this table.
ALTER TABLE "shops" ADD COLUMN IF NOT EXISTS "province" TEXT;
