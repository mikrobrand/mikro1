const STORAGE_KEY = "mikro_wishlist";

export function getWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isWishlisted(id: string): boolean {
  return getWishlist().includes(id);
}

export function toggleWishlist(id: string): string[] {
  const list = getWishlist();
  const idx = list.indexOf(id);
  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.unshift(id);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("wishlist-change"));
  return list;
}
