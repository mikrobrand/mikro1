"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getWishlist } from "@/lib/wishlist";
import Container from "@/components/Container";
import ProductCard from "@/components/ProductCard";

type ProductData = {
  id: string;
  title: string;
  priceKrw: number;
  sellerId: string;
  images: { url: string }[];
  seller: { sellerProfile?: { shopName: string } | null };
};

export default function WishlistPage() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    const ids = getWishlist();
    if (ids.length === 0) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/products/by-ids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error();
      const data: ProductData[] = await res.json();
      setProducts(data);
    } catch {
      console.error("Failed to load wishlist products");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();

    // Re-fetch when wishlist changes (e.g. user un-hearts from this page)
    const handler = () => {
      setIsLoading(true);
      fetchProducts();
    };
    window.addEventListener("wishlist-change", handler);
    return () => window.removeEventListener("wishlist-change", handler);
  }, [fetchProducts]);

  return (
    <Container>
      <div className="py-6">
        <h1 className="text-[22px] font-bold text-black mb-1">관심목록</h1>
        <p className="text-[13px] text-gray-500 mb-6">
          {isLoading ? "불러오는 중..." : `${products.length}개`}
        </p>

        {isLoading ? (
          <div className="py-20 text-center text-gray-400 text-sm">
            불러오는 중...
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[40px] mb-3">💛</p>
            <p className="text-[15px] text-gray-500 mb-6">
              관심 상품이 없어요
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-black text-white rounded-xl text-[14px] font-medium"
            >
              홈으로 가기
            </Link>
          </div>
        ) : (
          <div className="flex flex-col">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                priceKrw={product.priceKrw}
                imageUrl={product.images[0]?.url ?? null}
                shopName={product.seller.sellerProfile?.shopName ?? "알수없음"}
                sellerId={product.sellerId}
              />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
