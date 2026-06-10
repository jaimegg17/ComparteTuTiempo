CREATE TYPE "ServiceIntent" AS ENUM ('OFFER', 'REQUEST');

ALTER TABLE "services"
ADD COLUMN "intent" "ServiceIntent" NOT NULL DEFAULT 'OFFER';
