-- CreateEnum
CREATE TYPE "ProductImageKind" AS ENUM ('MAIN', 'CONTENT');

-- AlterTable: ProductImage - add kind column
ALTER TABLE "ProductImage" ADD COLUMN "kind" "ProductImageKind" NOT NULL DEFAULT 'MAIN';

-- AlterTable: ProductVariant - rename size → sizeLabel, make color non-null
-- 1. Fill NULL color values
UPDATE "ProductVariant" SET "color" = 'FREE' WHERE "color" IS NULL;
-- 2. Make color NOT NULL with default
ALTER TABLE "ProductVariant" ALTER COLUMN "color" SET NOT NULL;
ALTER TABLE "ProductVariant" ALTER COLUMN "color" SET DEFAULT 'FREE';

-- 3. Rename size to sizeLabel
ALTER TABLE "ProductVariant" RENAME COLUMN "size" TO "sizeLabel";
-- 4. Fill NULL sizeLabel values
UPDATE "ProductVariant" SET "sizeLabel" = 'FREE' WHERE "sizeLabel" IS NULL;
-- 5. Make sizeLabel NOT NULL with default
ALTER TABLE "ProductVariant" ALTER COLUMN "sizeLabel" SET NOT NULL;
ALTER TABLE "ProductVariant" ALTER COLUMN "sizeLabel" SET DEFAULT 'FREE';

-- 6. Add sku column
ALTER TABLE "ProductVariant" ADD COLUMN "sku" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");

-- CreateIndex (unique composite)
CREATE UNIQUE INDEX "ProductVariant_productId_color_sizeLabel_key" ON "ProductVariant"("productId", "color", "sizeLabel");
