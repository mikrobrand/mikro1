-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "itemsSubtotalKrw" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shipToMemo" TEXT;
