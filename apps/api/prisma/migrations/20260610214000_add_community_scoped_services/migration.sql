ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "communityId" INTEGER;

ALTER TABLE "services"
  ADD CONSTRAINT "services_communityId_fkey"
  FOREIGN KEY ("communityId") REFERENCES "communities"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "services_communityId_idx" ON "services"("communityId");
