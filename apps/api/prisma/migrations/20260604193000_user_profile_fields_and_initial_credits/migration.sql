-- Add personal profile fields and give users an initial time-credit balance.
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "dateOfBirth" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "gender" TEXT,
  ADD COLUMN IF NOT EXISTS "preferredLanguage" TEXT DEFAULT 'es';

ALTER TABLE "users" ALTER COLUMN "timeCredits" SET DEFAULT 300;

UPDATE "users"
SET "timeCredits" = 300
WHERE "timeCredits" = 0;
