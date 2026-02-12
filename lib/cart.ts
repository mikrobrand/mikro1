/**
 * localStorage 기반 장바구니 유틸리티
 * MVP: 서버 DB 장바구니 없이 클라이언트에서만 관리
 */

const CART_KEY = "mikro_cart";

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
}

/**
 * 장바구니 조회
 */
export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

/**
 * 장바구니에 아이템 추가
 * 동일 productId + variantId가 있으면 수량 합산
 */
export function addToCart(item: CartItem): void {
  const cart = getCart();
  const existing = cart.find(
    (x) => x.productId === item.productId && x.variantId === item.variantId
  );

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/**
 * 특정 아이템 수량 변경
 * quantity가 0 이하면 삭제
 */
export function updateQuantity(
  productId: string,
  variantId: string,
  quantity: number
): void {
  let cart = getCart();
  if (quantity <= 0) {
    cart = cart.filter(
      (x) => !(x.productId === productId && x.variantId === variantId)
    );
  } else {
    const item = cart.find(
      (x) => x.productId === productId && x.variantId === variantId
    );
    if (item) {
      item.quantity = quantity;
    }
  }
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/**
 * 특정 아이템 삭제
 */
export function removeItem(productId: string, variantId: string): void {
  const cart = getCart().filter(
    (x) => !(x.productId === productId && x.variantId === variantId)
  );
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/**
 * 장바구니 비우기
 */
export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
}

/**
 * 장바구니 아이템 개수
 */
export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}
