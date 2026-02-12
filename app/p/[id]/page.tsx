import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import ImageCarousel from "@/components/ImageCarousel";
import { formatKrw } from "@/lib/format";
import WishlistButton from "@/components/WishlistButton";
import AddToCartSection from "./AddToCartSection";

type Props = { params: Promise<{ id: string }> };

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      seller: { include: { sellerProfile: true } },
      variants: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!product || product.isDeleted || !product.isActive) notFound();

  const shopName = product.seller.sellerProfile?.shopName ?? "알수없음";
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const isSoldOut = totalStock <= 0;

  // Split images by kind
  const mainImages = product.images.filter((i) => i.kind === "MAIN");
  const contentImages = product.images.filter((i) => i.kind === "CONTENT");

  return (
    <Container>
      {/* Main images – Instagram-like horizontal swipe */}
      <ImageCarousel
        images={mainImages.map((i) => ({ url: i.url }))}
        aspect="3/4"
      />

      {/* Product info */}
      <div className="py-5">
        {/* Seller info */}
        <Link
          href={`/s/${product.sellerId}`}
          className="inline-flex items-center gap-2 mb-3"
        >
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-[11px] font-bold text-gray-500">
            {shopName.charAt(0)}
          </div>
          <span className="text-[14px] font-medium text-gray-700 hover:text-black transition-colors">
            {shopName}
          </span>
        </Link>

        <h1 className="text-[20px] font-bold text-black leading-tight">
          {product.title}
        </h1>

        <p className="mt-2 text-[24px] font-extrabold text-black">
          {formatKrw(product.priceKrw)}
        </p>

        {/* Sold out badge */}
        {isSoldOut && (
          <span className="mt-3 inline-block px-3 py-1.5 rounded-full bg-red-500 text-white text-[13px] font-bold">
            품절
          </span>
        )}

        {/* Add to cart section */}
        <div className="mt-6">
          <AddToCartSection
            productId={product.id}
            variants={product.variants}
            isSoldOut={isSoldOut}
          />
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </div>
        )}

        {/* Content images – stacked vertically */}
        {contentImages.length > 0 && (
          <div className="mt-6 pt-5 border-t border-gray-100 space-y-2">
            {contentImages.map((img) => (
              <div key={img.id} className="w-full rounded-lg overflow-hidden">
                <img
                  src={img.url}
                  alt=""
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}

        {/* Wishlist button */}
        <div className="mt-4 flex justify-end">
          <WishlistButton productId={product.id} variant="detail" />
        </div>
      </div>
    </Container>
  );
}
