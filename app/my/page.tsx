import Link from "next/link";
import Container from "@/components/Container";

export default function MyPage() {
  const hasSeller = !!process.env.MVP_SELLER_ID;

  return (
    <Container>
      <div className="pt-4 pb-20">
        <h1 className="text-[22px] font-bold text-black mb-6">MY</h1>

        {/* Profile placeholder */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-6">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-[18px]">
            👤
          </div>
          <div>
            <p className="text-[15px] font-medium text-gray-900">게스트</p>
            <p className="text-[12px] text-gray-400">로그인이 필요합니다</p>
          </div>
        </div>

        {/* Menu list */}
        <div className="flex flex-col">
          <Link
            href="#"
            className="py-4 border-b border-gray-50 text-[15px] text-gray-800 flex items-center justify-between"
          >
            주문내역
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/wishlist"
            className="py-4 border-b border-gray-50 text-[15px] text-gray-800 flex items-center justify-between"
          >
            관심목록
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {hasSeller && (
            <Link
              href="/seller"
              className="py-4 border-b border-gray-50 text-[15px] text-gray-800 flex items-center justify-between"
            >
              판매자 센터
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}

          <Link
            href="/policy/terms"
            className="py-4 border-b border-gray-50 text-[15px] text-gray-800 flex items-center justify-between"
          >
            이용약관
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/policy/privacy"
            className="py-4 border-b border-gray-50 text-[15px] text-gray-800 flex items-center justify-between"
          >
            개인정보처리방침
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </Container>
  );
}
