-- Data migration: sync isActive from status before dropping the column
UPDATE "Product" SET "isActive" = false WHERE "status" = 'HIDDEN' AND "isActive" = true;
UPDATE "Product" SET "isActive" = true WHERE "status" = 'SOLD_OUT' AND "isActive" = false;

-- Drop the status column
ALTER TABLE "Product" DROP COLUMN "status";

-- Drop the enum type
DROP TYPE "ProductStatus";
