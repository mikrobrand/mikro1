/**
 * 주문 관련 유틸리티 함수
 */

/**
 * 주문번호 생성 (표시용)
 * 형식: ORD-YYYYMMDD-RANDOM6
 * 예: ORD-20260212-A3F9K2
 */
export function generateOrderNo(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

  // 랜덤 6자리 (대문자 + 숫자)
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let random = "";
  for (let i = 0; i < 6; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `ORD-${dateStr}-${random}`;
}
