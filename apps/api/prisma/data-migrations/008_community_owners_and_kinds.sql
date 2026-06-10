-- 008_community_owners_and_kinds.sql
-- Inicializa tipo/verificación y membresías owner para comunidades existentes.

UPDATE communities
SET
  "kind" = CASE
    WHEN name IN ('Freelancers Tech España', 'Creadoras Visuales') THEN 'ORGANIZATION'::"CommunityKind"
    ELSE COALESCE("kind", 'COMMUNITY'::"CommunityKind")
  END,
  "verificationStatus" = CASE
    WHEN name IN ('Freelancers Tech España') THEN 'APPROVED'::"VerificationStatus"
    WHEN name IN ('Creadoras Visuales') THEN 'PENDING'::"VerificationStatus"
    WHEN COALESCE("kind", 'COMMUNITY'::"CommunityKind") = 'ORGANIZATION'::"CommunityKind"
      THEN COALESCE("verificationStatus", 'PENDING'::"VerificationStatus")
    ELSE COALESCE("verificationStatus", 'NONE'::"VerificationStatus")
  END,
  "updatedAt" = NOW();

INSERT INTO community_memberships (
  "communityId",
  "userId",
  "role",
  "status"
)
SELECT
  c.id,
  c."creatorId",
  'OWNER'::"CommunityMembershipRole",
  'ACTIVE'::"CommunityMembershipStatus"
FROM communities c
WHERE NOT EXISTS (
  SELECT 1
  FROM community_memberships cm
  WHERE cm."communityId" = c.id
    AND cm."userId" = c."creatorId"
);
