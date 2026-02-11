import Container from "@/components/Container";

export default function NewsPage() {
  return (
    <Container>
      <div className="pt-4 pb-20">
        <h1 className="text-[22px] font-bold text-black mb-6">뉴스</h1>
        <div className="py-20 text-center">
          <p className="text-[40px] mb-3">📰</p>
          <p className="text-[15px] text-gray-500">
            아직 등록된 소식이 없어요
          </p>
        </div>
      </div>
    </Container>
  );
}
