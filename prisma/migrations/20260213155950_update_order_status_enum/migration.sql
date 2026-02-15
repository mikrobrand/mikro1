-- Update existing OrderStatus enum - ensures backward compatibility
-- Mapping: PREPARING/SHIPPING→SHIPPED, DELIVERED→COMPLETED, CANCELED/CANCEL_REQUESTED→CANCELLED, PAYMENT_FAILED→FAILED

-- Create new enum with target values
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED', 'REFUND_REQUESTED', 'REFUNDED', 'FAILED');

-- Migrate data using CASE for deterministic mapping
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new"
USING (
  CASE "status"::text
    WHEN 'PENDING' THEN 'PENDING'
    WHEN 'PAID' THEN 'PAID'
    WHEN 'PREPARING' THEN 'SHIPPED'
    WHEN 'SHIPPING' THEN 'SHIPPED'
    WHEN 'DELIVERED' THEN 'COMPLETED'
    WHEN 'CANCEL_REQUESTED' THEN 'CANCELLED'
    WHEN 'CANCELED' THEN 'CANCELLED'
    WHEN 'CANCELLED' THEN 'CANCELLED'
    WHEN 'PAYMENT_FAILED' THEN 'FAILED'
    WHEN 'REFUNDED' THEN 'REFUNDED'
    WHEN 'FAILED' THEN 'FAILED'
    ELSE 'FAILED'  -- Safety fallback for any unexpected values
  END::"OrderStatus_new"
);
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"OrderStatus_new";

-- Drop old enum and rename new enum
DROP TYPE "OrderStatus";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
