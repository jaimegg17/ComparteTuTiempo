CREATE TABLE "event_registrations" (
    "eventId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("eventId","userId")
);

CREATE INDEX "event_registrations_userId_idx" ON "event_registrations"("userId");

ALTER TABLE "event_registrations"
ADD CONSTRAINT "event_registrations_eventId_fkey"
FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "event_registrations"
ADD CONSTRAINT "event_registrations_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
