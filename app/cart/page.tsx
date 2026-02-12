"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Container from "@/components/Container";
import { getCart, updateQuantity, removeItem, clearCart } from "@/lib/cart";
import { formatKrw } from "@/lib/format";

interface CartItemData {
  productId: string;
  variantId: string;
  quantity: number;
  product?: {
    id: string;
    title: string;
    priceKrw: number;
    images: { url: string }[];
    sellerId: string;
    seller: {
      sellerProfile: { shopName: string } | null;
    };
  };
  variant?: {
    id: string;
    sizeLabel: string;
    stock: number;
  };
}

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cart = getCart();

      if (cart.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      // Fetch product details
      const productIds = [...new Set(cart.map((i) => i.productId))];
      const res = await fetch("/api/products/by-ids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: productIds }),
      });

      if (!res.ok) throw new Error("Failed to fetch products");

      const products = await res.json();

      // Merge cart with product data
      const merged: CartItemData[] = cart
        .map((item) => {
          const product = products.find((p: any) => p.id === item.productId);
          if (!product) return null;

          const variant = product.variants?.find(
            (v: any) => v.id === item.variantId
          );
          if (!variant) return null;

          return {
            ...item,
            product,
            variant,
          };
        })
        .filter(Boolean) as CartItemData[];

      setItems(merged);
    } catch (err: any) {
      console.error("Failed to load cart:", err);
      setError("장바구니를 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = (
    productId: string,
    variantId: string,
    delta: number
  ) => {
    const item = items.find(
      (i) => i.productId === productId && i.variantId === variantId
    );
    if (!item) return;

    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      handleRemove(productId, variantId);
      return;
    }

    const maxStock = item.variant?.stock ?? 0;
    if (newQuantity > maxStock) {
      alert(`최대 ${maxStock}개까지 구매 가능합니다`);
      return;
    }

    updateQuantity(productId, variantId, newQuantity);
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.variantId === variantId
          ? { ...i, quantity: newQuantity }
          : i
      )
    );
  };

  const handleRemove = (productId: string, variantId: string) => {
    if (!confirm("이 상품을 장바구니에서 삭제하시겠습니까?")) return;
    removeItem(productId, variantId);
    setItems((prev) =>
      prev.filter(
        (i) => !(i.productId === productId && i.variantId === variantId)
      )
    );
  };

  const handleGoToCheckout = () => {
    if (items.length === 0) return;
    router.push("/checkout");
  };

  const totalAmount = items.reduce((sum, item) => {
    const price = item.product?.priceKrw ?? 0;
    return sum + price * item.quantity;
  }, 0);

  if (loading) {
    return (
      <Container>
        <div className="py-8 text-center text-gray-500">
          장바구니를 불러오는 중...
        </div>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container>
        <div className="py-16 text-center">
          <p className="text-[18px] font-medium text-gray-500">
            장바구니가 비어 있습니다
          </p>
          <Link
            href="/"
            className="mt-6 inline-block px-6 py-3 bg-black text-white rounded-xl text-[16px] font-bold active:bg-gray-800 transition-colors"
          >
            쇼핑 계속하기
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-6">
        <h1 className="text-[24px] font-bold text-black mb-6">장바구니</h1>

        {/* Cart items */}
        <div className="space-y-4">
          {items.map((item) => {
            const product = item.product;
            const variant = item.variant;
            if (!product || !variant) return null;

            const shopName =
              product.seller.sellerProfile?.shopName ?? "알수없음";
            const imageUrl = product.images[0]?.url || "/placeholder.png";
            const sizeLabel =
              variant.sizeLabel === "FREE" ? "FREE" : variant.sizeLabel;
            const subtotal = product.priceKrw * item.quantity;

            return (
              <div
                key={`${item.productId}-${item.variantId}`}
                className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100"
              >
                {/* Image */}
                <Link href={`/p/${product.id}`}>
                  <img
                    src={imageUrl}
                    alt={product.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/p/${product.id}`}>
                    <h3 className="text-[16px] font-bold text-black truncate">
                      {product.title}
                    </h3>
                  </Link>
                  <p className="text-[13px] text-gray-500 mt-1">{shopName}</p>
                  <p className="text-[13px] text-gray-600 mt-1">
                    사이즈: {sizeLabel}
                  </p>
                  <p className="text-[16px] font-bold text-black mt-2">
                    {formatKrw(subtotal)}
                  </p>

                  {/* Quantity controls */}
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateQuantity(
                          item.productId,
                          item.variantId,
                          -1
                        )
                      }
                      className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-bold text-[14px] active:bg-gray-200 transition-colors"
                    >
                      −
                    </button>
                    <span className="text-[14px] font-medium text-black min-w-[2ch] text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateQuantity(item.productId, item.variantId, 1)
                      }
                      className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-bold text-[14px] active:bg-gray-200 transition-colors"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.productId, item.variantId)}
                      className="ml-auto text-[13px] text-gray-500 hover:text-red-500 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-[16px] font-medium text-gray-700">
              총 금액
            </span>
            <span className="text-[24px] font-bold text-black">
              {formatKrw(totalAmount)}
            </span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-[14px]">
            {error}
          </div>
        )}

        {/* Checkout button */}
        <button
          type="button"
          onClick={handleGoToCheckout}
          className="mt-6 w-full h-[56px] bg-black text-white rounded-xl text-[18px] font-bold active:bg-gray-800 transition-colors"
        >
          결제하기
        </button>
      </div>
    </Container>
  );
}
