CREATE TABLE "user_favorite_services" (
    "userId" TEXT NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favorite_services_pkey" PRIMARY KEY ("userId","serviceId")
);

CREATE INDEX "user_favorite_services_serviceId_idx" ON "user_favorite_services"("serviceId");

ALTER TABLE "user_favorite_services"
ADD CONSTRAINT "user_favorite_services_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_favorite_services"
ADD CONSTRAINT "user_favorite_services_serviceId_fkey"
FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
