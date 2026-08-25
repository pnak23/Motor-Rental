-- Cambodian plates print a province/city (or "កម្ពុជា" for national plates)
-- above the plate code, e.g. "ភ្នំពេញ 1AC-2345". Store that separately from
-- the code itself so it can be a controlled selection in the UI rather than
-- free text mixed in with the code.
ALTER TABLE "motorbikes" ADD COLUMN IF NOT EXISTS "plateProvince" TEXT;
