-- Add organizations and direct community memberships
CREATE TYPE "CommunityKind" AS ENUM ('COMMUNITY', 'ORGANIZATION');
CREATE TYPE "VerificationStatus" AS ENUM ('NONE', 'PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "CommunityMembershipRole" AS ENUM ('OWNER', 'MEMBER');
CREATE TYPE "CommunityMembershipStatus" AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED');

ALTER TABLE "communities"
ADD COLUMN IF NOT EXISTS "kind" "CommunityKind" NOT NULL DEFAULT 'COMMUNITY',
ADD COLUMN IF NOT EXISTS "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'NONE';

CREATE TABLE IF NOT EXISTS "community_memberships" (
  "id" SERIAL NOT NULL,
  "communityId" INTEGER NOT NULL,
  "userId" TEXT NOT NULL,
  "role" "CommunityMembershipRole" NOT NULL DEFAULT 'MEMBER',
  "status" "CommunityMembershipStatus" NOT NULL DEFAULT 'ACTIVE',
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "community_memberships_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "community_memberships_communityId_userId_key"
ON "community_memberships"("communityId", "userId");

ALTER TABLE "community_memberships"
ADD CONSTRAINT "community_memberships_communityId_fkey"
FOREIGN KEY ("communityId") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "community_memberships"
ADD CONSTRAINT "community_memberships_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
