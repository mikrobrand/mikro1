/**
 * Helper to get the full current URL for login redirect
 * Includes pathname + search params
 */
export function getLoginRedirectUrl(): string {
  if (typeof window === "undefined") return "/";

  const pathname = window.location.pathname;
  const search = window.location.search;
  const fullPath = pathname + search;

  return `/login?next=${encodeURIComponent(fullPath)}`;
}
