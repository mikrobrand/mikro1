export type ProductBadge = "DELETED" | "HIDDEN" | "SOLD_OUT" | "ACTIVE";

export function getTotalStock(variants: { stock: number }[]): number {
  return variants.reduce((sum, v) => sum + v.stock, 0);
}

export function getProductBadge({
  isActive,
  isDeleted,
  totalStock,
}: {
  isActive: boolean;
  isDeleted: boolean;
  totalStock: number;
}): ProductBadge {
  if (isDeleted) return "DELETED";
  if (!isActive) return "HIDDEN";
  if (totalStock === 0) return "SOLD_OUT";
  return "ACTIVE";
}

export function isVisibleToCustomer(product: {
  isDeleted: boolean;
  isActive: boolean;
}): boolean {
  return !product.isDeleted && product.isActive;
}
