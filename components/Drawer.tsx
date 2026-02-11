"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
};

const sections = [
  {
    title: "카테고리",
    links: [
      { label: "바지", href: "/?category=pants" },
      { label: "아우터", href: "/?category=outer" },
      { label: "반팔티", href: "/?category=short" },
      { label: "긴팔티", href: "/?category=long" },
      { label: "니트", href: "/?category=knit" },
    ],
  },
  {
    title: "브랜드",
    links: [{ label: "브랜드 보기", href: "/brands" }],
  },
  {
    title: "판매자",
    links: [{ label: "판매자 센터", href: "/seller" }],
  },
  {
    title: "정책",
    links: [
      { label: "이용약관", href: "/policy/terms" },
      { label: "개인정보처리방침", href: "/policy/privacy" },
    ],
  },
  {
    title: "입점/광고",
    links: [{ label: "입점 안내", href: "/apply" }],
  },
];

export default function Drawer({ open, onClose }: DrawerProps) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  // Close on route change (not on initial mount)
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        aria-hidden={!open}
        className={`fixed top-0 right-0 z-[70] h-full w-[85%] max-w-[360px] bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          !open ? "pointer-events-none" : ""
        }`}
        style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-[52px] border-b border-gray-100">
          <span className="text-[16px] font-bold">메뉴</span>
          <button
            onClick={onClose}
            className="p-1"
            aria-label="닫기"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <nav className="overflow-y-auto h-[calc(100%-52px)] px-5 pb-10">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs uppercase text-gray-400 mt-6 mb-2 tracking-wide">
                {section.title}
              </h3>
              {section.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-3 border-b border-gray-50 text-base text-gray-800 active:text-black transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
