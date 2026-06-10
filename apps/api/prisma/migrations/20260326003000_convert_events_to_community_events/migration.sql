-- 20260326003000_convert_events_to_community_events
-- Convierte eventos ligados a groups en eventos ligados a communities.

ALTER TABLE "events"
ADD COLUMN "communityId" INTEGER,
ADD COLUMN "createdById" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "events" e
SET "communityId" = g.id,
    "createdById" = g."creatorId",
    "updatedAt" = COALESCE(g."updatedAt", e."createdAt")
FROM "groups" g
WHERE e."groupId" = g.id;

UPDATE "events" e
SET "createdById" = c."creatorId",
    "updatedAt" = COALESCE(e."updatedAt", c."updatedAt", e."createdAt")
FROM "communities" c
WHERE e."communityId" = c.id
  AND e."createdById" IS NULL;

DELETE FROM "events"
WHERE "communityId" IS NULL
   OR "createdById" IS NULL;

ALTER TABLE "events"
ALTER COLUMN "communityId" SET NOT NULL,
ALTER COLUMN "createdById" SET NOT NULL;

ALTER TABLE "events"
ADD CONSTRAINT "events_communityId_fkey"
FOREIGN KEY ("communityId") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "events"
ADD CONSTRAINT "events_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DROP INDEX IF EXISTS "events_groupId_idx";
CREATE INDEX "events_communityId_idx" ON "events"("communityId");

ALTER TABLE "events"
DROP CONSTRAINT IF EXISTS "events_groupId_fkey";

ALTER TABLE "events"
DROP COLUMN "groupId";
