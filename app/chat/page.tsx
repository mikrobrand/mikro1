import Container from "@/components/Container";

export default function ChatPage() {
  return (
    <Container>
      <div className="pt-4 pb-20">
        <h1 className="text-[22px] font-bold text-black mb-6">채팅</h1>
        <div className="py-20 text-center">
          <p className="text-[40px] mb-3">💬</p>
          <p className="text-[15px] text-gray-500">
            로그인 후 이용할 수 있어요
          </p>
          <p className="text-[12px] text-gray-400 mt-1">
            MVP placeholder
          </p>
        </div>
      </div>
    </Container>
  );
}
