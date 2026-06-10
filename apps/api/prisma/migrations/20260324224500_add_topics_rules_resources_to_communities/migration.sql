-- Add richer community metadata for UX improvements
ALTER TABLE "communities"
ADD COLUMN IF NOT EXISTS "topics" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "rules" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "resources" JSONB NOT NULL DEFAULT '[]'::jsonb;

