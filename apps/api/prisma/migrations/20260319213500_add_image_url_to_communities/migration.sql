-- Add optional imageUrl to communities so demo/test data can have cover images
ALTER TABLE "communities"
ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
