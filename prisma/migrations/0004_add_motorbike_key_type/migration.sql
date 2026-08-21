-- Records whether a motorbike uses a smart (keyless/proximity) ignition
-- key or a normal physical key, since Siem Reap rental fleets mix both
-- and renters need to know which one they'll get.
DO $$ BEGIN
  CREATE TYPE "KeyType" AS ENUM ('NORMAL_KEY', 'SMART_KEY');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "motorbikes" ADD COLUMN IF NOT EXISTS "keyType" "KeyType" NOT NULL DEFAULT 'NORMAL_KEY';
