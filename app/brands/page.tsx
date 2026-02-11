import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";

export default async function BrandsPage() {
  const sellers = await prisma.sellerProfile.findMany({
    where: { status: "APPROVED" },
    orderBy: { shopName: "asc" },
    include: { user: true },
  });

  return (
    <Container>
      <div className="pt-4 pb-20">
        <h1 className="text-[22px] font-bold text-black mb-1">입점 브랜드</h1>
        <p className="text-[13px] text-gray-500 mb-6">
          {sellers.length}개 브랜드
        </p>

        {sellers.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[40px] mb-3">🏬</p>
            <p className="text-[15px] text-gray-500">
              아직 입점된 브랜드가 없어요
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {sellers.map((seller) => (
              <Link
                key={seller.id}
                href={`/s/${seller.userId}`}
                className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-[20px] font-bold text-gray-500 shadow-sm mb-2">
                  {seller.shopName.charAt(0)}
                </div>
                <span className="text-[14px] font-medium text-gray-900 text-center">
                  {seller.shopName}
                </span>
                {seller.type && (
                  <span className="mt-1 text-[11px] text-gray-400">
                    {seller.type}
                  </span>
                )}
                <span className="mt-0.5 text-[11px] text-gray-400">
                  {[seller.marketBuilding, seller.floor && `${seller.floor}층`]
                    .filter(Boolean)
                    .join(" ")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
