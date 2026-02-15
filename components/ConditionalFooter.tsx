"use client";

import { usePathname } from "next/navigation";
import CompanyFooter from "./CompanyFooter";

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Don't show footer on home page
  if (pathname === "/") {
    return null;
  }

  return <CompanyFooter />;
}
