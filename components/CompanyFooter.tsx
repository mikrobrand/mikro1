export default function CompanyFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8 px-5 mt-12">
      <div className="max-w-[420px] mx-auto">
        <div className="space-y-4 text-[13px] text-gray-600">
          {/* Company Info */}
          <div>
            <p className="font-bold text-gray-800 mb-2">미크로</p>
            <p>대표자: 김동현</p>
            <p>사업자등록번호: 443-65-00701</p>
            <p>통신판매업 신고번호: 2025-서울구로-0131</p>
          </div>

          {/* Contact */}
          <div>
            <p>고객센터: mikrobrand25@gmail.com</p>
            <p>개인정보보호: mikrodataprotection@gmail.com</p>
            <p className="text-[12px] text-gray-500 mt-1">평일 10:00 - 18:00 (주말·공휴일 휴무)</p>
          </div>

          {/* Address */}
          <div className="text-[12px] text-gray-500">
            <p>OFFICE: 93, Saemal-ro, Guro-gu, Seoul</p>
            <p>HEAD OFFICE: 5F 90, Gyeongin-ro 53-gil, Guro-gu, Seoul</p>
          </div>

          {/* Links */}
          <div className="flex gap-3 flex-wrap text-[13px]">
            <a href="/info" className="text-gray-700 hover:text-black underline">
              사업자 정보
            </a>
            <a href="/policy/terms" className="text-gray-700 hover:text-black underline">
              이용약관
            </a>
            <a href="/policy/privacy" className="text-gray-700 hover:text-black underline">
              개인정보처리방침
            </a>
            <a href="/policy/returns" className="text-gray-700 hover:text-black underline">
              환불·교환·반품
            </a>
          </div>

          {/* Copyright */}
          <div className="text-[12px] text-gray-400 pt-2 border-t border-gray-200">
            <p>© 2026 mikro. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
