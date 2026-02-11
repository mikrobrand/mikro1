import Container from "@/components/Container";

export default function PrivacyPage() {
  return (
    <Container>
      <div className="pt-4 pb-20">
        <h1 className="text-[22px] font-bold text-black mb-6">개인정보처리방침</h1>

        <div className="space-y-6 text-[14px] text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-[16px] font-bold text-black mb-2">1. 수집하는 개인정보 항목</h2>
            <p>
              회사는 서비스 제공을 위해 다음의 개인정보를 수집합니다:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>이메일 주소</li>
              <li>이름 (닉네임)</li>
              <li>연락처 (판매자의 경우)</li>
              <li>사업자등록 정보 (판매자의 경우)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-black mb-2">2. 개인정보의 수집·이용 목적</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>서비스 회원 가입 및 관리</li>
              <li>상품 주문 및 배송</li>
              <li>판매자 입점 심사 및 관리</li>
              <li>고객 문의 응대</li>
              <li>서비스 개선 및 통계 분석</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-black mb-2">3. 개인정보의 보유·이용 기간</h2>
            <p>
              회원 탈퇴 시 즉시 파기합니다. 단, 관련 법령에 따라 보존이 필요한
              경우에는 해당 기간 동안 보관합니다:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
              <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
              <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-black mb-2">4. 개인정보의 제3자 제공</h2>
            <p>
              회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
              다만, 이용자의 동의가 있거나 법령의 규정에 의한 경우에는 예외로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-bold text-black mb-2">5. 개인정보 보호책임자</h2>
            <p>
              이름: mikro 개인정보보호팀<br />
              이메일: privacy@mikro.kr
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
