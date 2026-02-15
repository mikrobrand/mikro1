# Verification Checklist - Auth UX & Address Input Improvements

## Files Modified

### Core Changes
1. **lib/authHelpers.ts** (NEW)
   - Created helper function `getLoginRedirectUrl()` to centralize login redirect logic
   - Includes full pathname + search params in `next` parameter

2. **app/p/[id]/AddToCartSection.tsx**
   - ✅ Buttons are NOT disabled for unauthenticated users
   - ✅ Only disabled for: `isSoldOut || !selectedVariantId || loading`
   - ✅ Auth checks happen in `onClick` handlers BEFORE API calls
   - ✅ Uses `getLoginRedirectUrl()` for consistent redirect logic
   - ✅ Unauthenticated: Shows "로그인이 필요합니다" → redirects after 1s
   - ✅ SELLER role: Shows "구매는 고객 계정만 가능합니다" → NO redirect

3. **app/p/[id]/page.tsx**
   - ✅ Fetches session server-side with `getSession()`
   - ✅ Passes `userRole` prop to AddToCartSection

4. **components/AddressForm.tsx**
   - ✅ Daum Postcode script loading with error handling
   - ✅ `scriptError` state to track loading failures
   - ✅ `onerror` handler on script element
   - ✅ Retry button shown on script load failure
   - ✅ Loading state: "주소 검색 준비 중..."
   - ✅ Removes existing script before retry
   - ✅ Cleanup in useEffect return

5. **app/checkout/page.tsx**
   - ✅ `reloadAddresses()` fetches from server after POST
   - ✅ Updates `selectedAddress` to default or first address if previous was deleted
   - ✅ Address selector modal with visual selection
   - ✅ "새 배송지 추가" button in both empty state and address selected state

## Build Status

```bash
✓ Compiled successfully
✓ TypeScript checks passed
✓ All routes generated successfully
```

## Manual Testing Checklist

### 1. Unauthenticated User Flow (Priority 1)

**Test Case 1.1: Cart Button Click**
- [ ] Navigate to `/p/[productId]` WITHOUT logging in
- [ ] Select size variant
- [ ] Click "장바구니" button
- [ ] ✅ Button should be clickable (NOT disabled)
- [ ] ✅ Should show "로그인이 필요합니다" toast message
- [ ] ✅ Should redirect to `/login?next=/p/[productId]` after 1 second
- [ ] ✅ After login, should return to `/p/[productId]`

**Test Case 1.2: Direct Purchase Button Click**
- [ ] Navigate to `/p/[productId]` WITHOUT logging in
- [ ] Select size variant
- [ ] Click "바로구매" button
- [ ] ✅ Button should be clickable (NOT disabled)
- [ ] ✅ Should show "로그인이 필요합니다" toast message
- [ ] ✅ Should redirect to `/login?next=/p/[productId]` after 1 second

**Test Case 1.3: Product with Query Params**
- [ ] Navigate to `/p/[productId]?ref=campaign&source=email`
- [ ] Click cart or purchase button
- [ ] ✅ Redirect should preserve query params: `/login?next=%2Fp%2F[productId]%3Fref%3Dcampaign%26source%3Demail`

### 2. SELLER User Flow (Priority 1)

**Test Case 2.1: SELLER Attempting Purchase**
- [ ] Login as SELLER (id="s", pw="s")
- [ ] Navigate to any product detail page
- [ ] Select size variant
- [ ] Click "장바구니" or "바로구매" button
- [ ] ✅ Button should be clickable (NOT disabled)
- [ ] ✅ Should show "구매는 고객 계정만 가능합니다" toast message
- [ ] ✅ Should NOT redirect to login
- [ ] ✅ Message should disappear after 2 seconds

### 3. CUSTOMER User Flow (Priority 2)

**Test Case 3.1: Normal Purchase Flow**
- [ ] Login as CUSTOMER (id="1", pw="1")
- [ ] Navigate to product detail page
- [ ] Select size variant
- [ ] Click "장바구니" button
- [ ] ✅ Should add to cart successfully
- [ ] ✅ Should show "장바구니에 담았습니다" message

**Test Case 3.2: Out of Stock**
- [ ] Login as CUSTOMER
- [ ] Navigate to product with zero stock variant
- [ ] ✅ Size button should be disabled and line-through
- [ ] ✅ Cannot select out-of-stock variant

### 4. Korean Address Input (Priority 1)

**Test Case 4.1: Add First Address**
- [ ] Login as CUSTOMER
- [ ] Add items to cart
- [ ] Navigate to `/checkout`
- [ ] ✅ Should see "등록된 배송지가 없습니다" message
- [ ] Click "새 배송지 추가" button
- [ ] ✅ AddressForm modal should open
- [ ] ✅ Address search button should show "주소 검색 준비 중..." initially
- [ ] ✅ Wait ~1-2 seconds for script to load
- [ ] Click "주소 검색" button
- [ ] ✅ Daum Postcode popup should open
- [ ] Search for "강남구" and select an address
- [ ] ✅ zipCode and addr1 should auto-fill
- [ ] Enter detailed address in addr2 field
- [ ] Enter name and phone
- [ ] Check "기본 배송지로 설정"
- [ ] Click "저장"
- [ ] ✅ Modal should close
- [ ] ✅ Address should appear in checkout page
- [ ] ✅ Address should be selected automatically

**Test Case 4.2: Script Loading Error Handling**
- [ ] Open DevTools → Network tab
- [ ] Set network throttling to "Offline"
- [ ] Open AddressForm modal
- [ ] ✅ Should show error: "주소 검색 서비스를 불러오지 못했습니다"
- [ ] ✅ Should show "다시 시도" button
- [ ] Set network back to "Online"
- [ ] Click "다시 시도"
- [ ] ✅ Script should load successfully
- [ ] ✅ Error message should disappear

**Test Case 4.3: Add Multiple Addresses**
- [ ] Add first address with isDefault=true
- [ ] Click "새 배송지 추가" again
- [ ] Add second address with isDefault=true
- [ ] ✅ First address should lose default status
- [ ] ✅ Second address should become default
- [ ] ✅ Both addresses should appear in address list

**Test Case 4.4: Address Selector Modal**
- [ ] In checkout with 2+ addresses
- [ ] Click "배송지 변경"
- [ ] ✅ Address selector modal should open
- [ ] ✅ Current selected address should have black border + gray background
- [ ] ✅ Default address should show "기본" badge
- [ ] Click different address
- [ ] ✅ Modal should close
- [ ] ✅ Selected address should update in checkout page

**Test Case 4.5: Address Reload After Save**
- [ ] Open browser DevTools → Network tab
- [ ] Add new address in checkout
- [ ] Click "저장"
- [ ] ✅ Should see POST /api/addresses request (201)
- [ ] ✅ Should see GET /api/addresses request immediately after
- [ ] ✅ New address should appear in UI
- [ ] ✅ Address should persist after page refresh

### 5. Signup Flow (Already Complete - Quick Verification)

**Test Case 5.1: Signup from Login Page**
- [ ] Navigate to `/login`
- [ ] ✅ Should see "계정이 없으신가요? 회원가입" link
- [ ] Click "회원가입" link
- [ ] ✅ Should navigate to `/signup`
- [ ] Enter email, password, password confirm
- [ ] Click "회원가입"
- [ ] ✅ Should auto-login and redirect to home

**Test Case 5.2: Signup API Validation**
- [ ] Navigate to `/signup`
- [ ] Test duplicate email (use existing email)
- [ ] ✅ Should show "이미 사용 중인 이메일입니다" (409)
- [ ] Test password mismatch
- [ ] ✅ Should show "비밀번호가 일치하지 않습니다"
- [ ] Test short password (< 6 chars)
- [ ] ✅ Should show "비밀번호는 최소 6자 이상이어야 합니다"

## Edge Cases

### E1. No Overlay Blocking Clicks
- [ ] Product detail page with unauthenticated user
- [ ] ✅ NO transparent overlay should cover buttons
- [ ] ✅ NO pointer-events-none on buttons
- [ ] ✅ cursor-not-allowed should ONLY appear for soldOut/loading states

### E2. Concurrent Address Form Opens
- [ ] Open AddressForm
- [ ] Don't close it, try to open another (should not be possible due to modal)
- [ ] ✅ Only one modal should be open at a time

### E3. Address Form Script Cleanup
- [ ] Open AddressForm modal
- [ ] Click "취소" to close
- [ ] Open DevTools → Elements → Search for "postcode.v2.js"
- [ ] ✅ Script should be removed from DOM after modal closes

### E4. Default Address Logic
- [ ] Have 3 addresses: A (default), B, C
- [ ] Delete address A via API
- [ ] Refresh checkout page
- [ ] ✅ Most recent remaining address (B or C) should become default

## Performance Checks

- [ ] Product detail page loads in < 2s (authenticated)
- [ ] Product detail page loads in < 2s (unauthenticated)
- [ ] AddressForm opens in < 500ms
- [ ] Daum Postcode script loads in < 2s
- [ ] Address save + reload completes in < 1s

## Accessibility Checks

- [ ] All buttons have proper hover/active states
- [ ] All modals can be closed with Escape key (if implemented)
- [ ] All form inputs have labels
- [ ] Error messages are clearly visible (red color + sufficient contrast)
- [ ] Loading states have clear indicators

## Browser Compatibility

- [ ] Chrome/Edge (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Summary

All 5 verification points from the user's request have been addressed:

1. ✅ **No disabled/pointer-events-none blocking clicks** - Buttons stay clickable, only onClick handles auth
2. ✅ **next param includes full path + query** - Helper function `getLoginRedirectUrl()` created
3. ✅ **AddressForm handles script loading errors** - Error message + retry button implemented
4. ✅ **Checkout reloads addresses from server** - `reloadAddresses()` fetches from API
5. ✅ **Build successful** - All TypeScript checks passed, no errors
