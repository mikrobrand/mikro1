/**
 * Instagram-style product grid tile
 * Square 1:1 aspect ratio, minimal padding, price overlay
 */

import Link from "next/link";

export interface ProductGridTileProps {
  id: string;
  title: string;
  priceKrw: number;
  imageUrl?: string;
}

export default function ProductGridTile({
  id,
  title,
  priceKrw,
  imageUrl,
}: ProductGridTileProps) {
  const formattedPrice = priceKrw.toLocaleString("ko-KR");

  return (
    <Link href={`/p/${id}`} className="block">
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-[12px]">
            No Image
          </div>
        )}

        {/* Price overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
          <p className="text-white text-[13px] font-bold">
            ₩{formattedPrice}
          </p>
        </div>
      </div>

      {/* Title below image (optional, can remove for pure IG style) */}
      <p className="mt-1 text-[12px] text-gray-700 truncate px-0.5">
        {title}
      </p>
    </Link>
  );
}
