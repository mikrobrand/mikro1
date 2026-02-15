"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type LogoutButtonProps = {
  variant?: "default" | "drawer";
};

export default function LogoutButton({ variant = "default" }: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch {
      setLoading(false);
    }
  }

  if (variant === "drawer") {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        className="w-full h-12 rounded-xl bg-gray-100 text-gray-700 text-[14px] font-medium active:bg-gray-200 transition-colors disabled:opacity-50"
      >
        {loading ? "로그아웃 중..." : "로그아웃"}
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] text-gray-500 active:bg-gray-100 transition-colors disabled:opacity-50"
    >
      {loading ? "..." : "로그아웃"}
    </button>
  );
}
