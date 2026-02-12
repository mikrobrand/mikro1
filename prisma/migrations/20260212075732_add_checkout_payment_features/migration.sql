-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'CANCELLED';
ALTER TYPE "OrderStatus" ADD VALUE 'FAILED';

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'DONE';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "totalPayKrw" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SellerProfile" ADD COLUMN     "freeShippingThreshold" INTEGER NOT NULL DEFAULT 50000,
ADD COLUMN     "shippingFeeKrw" INTEGER NOT NULL DEFAULT 3000;

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "addr1" TEXT NOT NULL,
    "addr2" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "Address"("userId");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
