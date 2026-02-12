"use client";

import { useRef, useState, useEffect, useCallback } from "react";

type Props = {
  images: { url: string }[];
  aspect?: string;
  /** Show dot indicators (default true) */
  dots?: boolean;
  /** Extra CSS classes on the wrapper */
  className?: string;
};

export default function ImageCarousel({
  images,
  aspect = "3/4",
  dots = true,
  className = "",
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.offsetWidth);
    setCurrent(idx);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (images.length === 0) {
    return (
      <div
        className={`w-full bg-gray-100 flex items-center justify-center text-gray-300 text-sm ${className}`}
        style={{ aspectRatio: aspect }}
      >
        이미지 없음
      </div>
    );
  }

  // Single image — no scroll needed
  if (images.length === 1) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full overflow-hidden" style={{ aspectRatio: aspect }}>
          <img
            src={images[0].url}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        {images.map((img, i) => (
          <div
            key={i}
            className="shrink-0 w-full snap-start overflow-hidden"
            style={{ aspectRatio: aspect }}
          >
            <img
              src={img.url}
              alt=""
              className="w-full h-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      {dots && images.length > 1 && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <div
              key={i}
              className={`w-[6px] h-[6px] rounded-full transition-all duration-200 ${
                i === current
                  ? "bg-white scale-110"
                  : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}

      {/* Counter badge (top-right) for many images */}
      {images.length > 5 && (
        <div className="absolute top-2.5 right-2.5 bg-black/50 text-white text-[11px] font-medium px-2 py-0.5 rounded-full">
          {current + 1}/{images.length}
        </div>
      )}
    </div>
  );
}
