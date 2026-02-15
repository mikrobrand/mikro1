# Variant System Hardening - Test Matrix

## Prerequisites
- Test user: CUSTOMER (id="1", pw="1")
- Test seller: SELLER (id="s", pw="s")
- At least 2 products with variants created

## Test 1: Delete Variant Used in Cart → 409

**Setup:**
1. Login as CUSTOMER
2. Add product variant to cart (e.g., "청바지 BLACK M")
3. Note the variantId from cart API response

**Test:**
1. Login as SELLER
2. Navigate to product edit page
3. Attempt to delete the variant "BLACK M"
4. Submit update

**Expected Result:**
- API returns 409 Conflict
- Error message: "장바구니나 주문에 사용 중인 옵션은 삭제하거나 변경할 수 없습니다"
- Variant still exists in database
- Cart item unchanged

**DB State Check:**
```sql
-- Variant still exists
SELECT * FROM "ProductVariant" WHERE id = '<variantId>';

-- Cart item still references variant
SELECT * FROM "CartItem" WHERE "variantId" = '<variantId>';
```

---

## Test 2: Delete Variant Used in Order → 409

**Setup:**
1. Login as CUSTOMER
2. Create order with variant "청바지 CHARCOAL L"
3. Complete payment simulation (status = PAID)
4. Note the variantId

**Test:**
1. Login as SELLER
2. Navigate to product edit page
3. Attempt to delete variant "CHARCOAL L"
4. Submit update

**Expected Result:**
- API returns 409 Conflict
- Error message: "장바구니나 주문에 사용 중인 옵션은 삭제하거나 변경할 수 없습니다"
- Variant still exists
- OrderItem unchanged

**DB State Check:**
```sql
-- Variant still exists
SELECT * FROM "ProductVariant" WHERE id = '<variantId>';

-- OrderItem still references variant
SELECT * FROM "OrderItem" WHERE "variantId" = '<variantId>';
```

---

## Test 3: Change Case of Color → No New Variant Created

**Setup:**
1. Create product with variant "BLACK" / "M" / stock: 10

**Test:**
1. Edit product
2. Change color from "BLACK" to "black" (lowercase)
3. Submit update

**Expected Result:**
- No error
- Variant updated in-place (same ID)
- color normalized to "BLACK" (uppercase)
- No duplicate variant created

**DB State Check:**
```sql
-- Only one variant exists
SELECT COUNT(*) FROM "ProductVariant"
WHERE "productId" = '<productId>'
AND UPPER(color) = 'BLACK'
AND UPPER("sizeLabel") = 'M';
-- Expected: 1

-- Color is normalized to uppercase
SELECT color FROM "ProductVariant" WHERE id = '<variantId>';
-- Expected: "BLACK"
```

---

## Test 4: Change Color/Size of Variant in Cart → 409

**Setup:**
1. Login as CUSTOMER
2. Add variant "GRAY S" to cart
3. Note variantId

**Test:**
1. Login as SELLER
2. Edit product
3. Change "GRAY S" to "NAVY S" (semantic change)
4. Submit update

**Expected Result:**
- API returns 409 Conflict
- Error message: "장바구니나 주문에 사용 중인 옵션은 삭제하거나 변경할 수 없습니다"
- Original variant "GRAY S" unchanged
- Cart still references correct variant

**DB State Check:**
```sql
-- Variant unchanged
SELECT color, "sizeLabel" FROM "ProductVariant" WHERE id = '<variantId>';
-- Expected: color='GRAY', sizeLabel='S'

-- Cart item unchanged
SELECT * FROM "CartItem" WHERE "variantId" = '<variantId>';
```

---

## Test 5: Checkout After Variant Deletion → Cart Auto-Clean

**Setup:**
1. Login as CUSTOMER
2. Add 2 variants to cart:
   - Variant A: "BEIGE L" (will be deleted)
   - Variant B: "WHITE M" (will stay)

**Test:**
1. Login as SELLER
2. Delete product containing variant A (soft delete or hard delete variant)
3. Login as CUSTOMER
4. Navigate to `/cart` or call GET `/api/cart`

**Expected Result:**
- Variant A auto-removed from cart
- Variant B remains in cart
- No error shown to user
- Cart displays only variant B

**DB State Check:**
```sql
-- Cart item for deleted variant removed
SELECT COUNT(*) FROM "CartItem" WHERE "variantId" = '<variantAId>';
-- Expected: 0

-- Cart item for active variant remains
SELECT COUNT(*) FROM "CartItem" WHERE "variantId" = '<variantBId>';
-- Expected: 1
```

---

## Test 6: Concurrent Variant Patch → No Duplicates

**Setup:**
1. Product with variant "BLACK M" stock: 10

**Test:**
1. Open 2 browser tabs as SELLER
2. Tab 1: Edit product, add variant "BLACK L"
3. Tab 2: Edit product, add variant "BLACK L" (same)
4. Submit Tab 1 first, then Tab 2 immediately

**Expected Result:**
- First request succeeds
- Second request either:
  - Succeeds with duplicate detection (no-op)
  - Fails with 400 "중복된 옵션"
- **No duplicate variants created**

**DB State Check:**
```sql
-- Only one "BLACK L" variant exists
SELECT COUNT(*) FROM "ProductVariant"
WHERE "productId" = '<productId>'
AND color = 'BLACK'
AND "sizeLabel" = 'L';
-- Expected: 1
```

---

## Test 7: Payment Simulation Race Condition → Stock Deducted Once

**Setup:**
1. Create product with variant stock: 5
2. Create 2 orders each requesting quantity: 3

**Test:**
1. Simulate payment for both orders concurrently using 2 API calls
2. Use Promise.all() or parallel requests

**Expected Result:**
- First order succeeds: stock deducted (5 → 2)
- Second order fails: 409 OUT_OF_STOCK
- Total stock deducted: 3 (not 6)

**DB State Check:**
```sql
-- Stock deducted correctly
SELECT stock FROM "ProductVariant" WHERE id = '<variantId>';
-- Expected: 2

-- Only one order paid
SELECT COUNT(*) FROM "Order" WHERE status = 'PAID' AND id IN ('<orderId1>', '<orderId2>');
-- Expected: 1
```

---

## Test 8: Stock-Only Update on Variant in Cart → Allowed

**Setup:**
1. Login as CUSTOMER
2. Add variant "CHARCOAL M" stock: 20 to cart

**Test:**
1. Login as SELLER
2. Edit product
3. Change "CHARCOAL M" stock from 20 to 50 (no color/size change)
4. Submit update

**Expected Result:**
- Update succeeds (200)
- Stock updated to 50
- Same variantId preserved
- Cart item still valid

**DB State Check:**
```sql
-- Stock updated
SELECT stock FROM "ProductVariant" WHERE id = '<variantId>';
-- Expected: 50

-- Variant ID unchanged
SELECT id FROM "ProductVariant"
WHERE "productId" = '<productId>'
AND color = 'CHARCOAL'
AND "sizeLabel" = 'M';
-- Expected: <same variantId>
```

---

## Test 9: Normalization - Leading/Trailing Whitespace

**Setup:**
1. Create product

**Test:**
1. Add variant with color: " BLACK  " (spaces)
2. Add variant with color: "BLACK" (no spaces)
3. Submit

**Expected Result:**
- Validation error: 400 "중복된 옵션"
- Only one variant created (normalized to "BLACK")

**DB State Check:**
```sql
-- No whitespace in stored values
SELECT color FROM "ProductVariant" WHERE "productId" = '<productId>';
-- Expected: All colors have no leading/trailing spaces
```

---

## Test 10: Orphaned Variant Cleanup in Cart

**Setup:**
1. Manually delete ProductVariant from DB (bypass API)
   ```sql
   DELETE FROM "ProductVariant" WHERE id = '<variantId>';
   ```
2. CartItem still references deleted variantId

**Test:**
1. Login as CUSTOMER
2. Call GET `/api/cart`

**Expected Result:**
- Cart auto-removes orphaned item
- No error thrown
- Remaining cart items displayed correctly

**DB State Check:**
```sql
-- Orphaned cart item removed
SELECT COUNT(*) FROM "CartItem" WHERE "variantId" = '<deletedVariantId>';
-- Expected: 0
```

---

## Summary Checklist

| Test | Description | Expected Result | Status |
|------|-------------|-----------------|--------|
| 1 | Delete variant in cart | 409 VARIANT_IN_USE | ☐ |
| 2 | Delete variant in order | 409 VARIANT_IN_USE | ☐ |
| 3 | Case change normalization | No duplicate | ☐ |
| 4 | Change color/size in cart | 409 VARIANT_IN_USE | ☐ |
| 5 | Checkout auto-cleanup | Orphans removed | ☐ |
| 6 | Concurrent duplicate | No duplicate | ☐ |
| 7 | Payment race condition | Stock correct | ☐ |
| 8 | Stock-only update | Allowed | ☐ |
| 9 | Whitespace normalization | Duplicate detected | ☐ |
| 10 | Orphaned variant cleanup | Auto-removed | ☐ |

---

## Post-Test Validation

After running all tests, execute:

```bash
# Run integrity audit
node scripts/variant-integrity-audit.mjs

# Expected output:
# ✅ AUDIT PASSED: All integrity checks passed
```

## Rollback Plan

If tests fail:
1. Check Prisma migration status: `npx prisma migrate status`
2. Review error logs in API responses
3. Inspect database state with SQL queries above
4. Revert migrations if needed: `npx prisma migrate resolve --rolled-back <migration_name>`
