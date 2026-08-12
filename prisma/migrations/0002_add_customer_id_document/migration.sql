-- Adds ID Card / Passport type and uploaded document URL to customers,
-- captured on the public booking form alongside the existing passportId
-- (used as the free-text ID/passport number field).
DO $$ BEGIN
  CREATE TYPE "CustomerIdType" AS ENUM ('ID_CARD', 'PASSPORT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "idType" "CustomerIdType";
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "idDocumentUrl" TEXT;
