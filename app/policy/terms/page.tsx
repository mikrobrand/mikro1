import Container from "@/components/Container";

export default function TermsPage() {
  return (
    <Container>
      <div className="pt-4 pb-20">
        <h1 className="text-[22px] font-bold text-black mb-6">이용약관</h1>

        <div className="space-y-6 text-[14px] text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-[16px] font-bold text-black mb-2">제1조 (목적)</h2>
            <p>
              이 약관은 mikro(이하 &quot;회사&quot;)가 제공하는 온라인 패션 플랫폼
              서비스(이하 &quot;서비스&quot;)의 이용 조건 및 절차, 회사와 회원 간의
              권리·의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-black mb-2">제2조 (정의)</h2>
            <p>
              ① &quot;서비스&quot;란 회사가 제공하는 동대문 패션 도·소매 중개 플랫폼을
              의미합니다.
            </p>
            <p className="mt-1">
              ② &quot;회원&quot;이란 본 약관에 동의하고 서비스를 이용하는 자를 의미합니다.
            </p>
            <p className="mt-1">
              ③ &quot;판매자&quot;란 회사의 승인을 받아 서비스를 통해 상품을 판매하는
              사업자를 의미합니다.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-black mb-2">제3조 (약관의 효력)</h2>
            <p>
              이 약관은 서비스를 이용하고자 하는 모든 회원에게 적용됩니다.
              회사는 관련 법령에 위배되지 않는 범위에서 본 약관을 개정할 수 있으며,
              개정 시 적용일자 및 개정사유를 명시하여 공지합니다.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-black mb-2">제4조 (서비스의 제공)</h2>
            <p>
              회사는 다음과 같은 서비스를 제공합니다:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>패션 상품 정보 제공 및 중개</li>
              <li>판매자와 구매자 간 거래 지원</li>
              <li>상품 검색 및 브랜드(판매자) 탐색</li>
              <li>기타 회사가 정하는 부가 서비스</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-black mb-2">제5조 (면책조항)</h2>
            <p>
              회사는 판매자가 등록한 상품 정보의 정확성에 대해 보증하지 않습니다.
              거래에 관한 분쟁은 당사자 간 해결을 원칙으로 하며,
              회사는 중재 역할을 위해 노력합니다.
            </p>
          </section>

          <p className="text-[12px] text-gray-400 mt-8">
            시행일: 2025년 1월 1일
          </p>
        </div>
      </div>
    </Container>
  );
}
