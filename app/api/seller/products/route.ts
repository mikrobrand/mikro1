import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole("SELLER");
    if (!session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다 (판매자 전용)" },
        { status: 401 },
      );
    }

    const sellerId = session.userId;
    const body = await req.json();
    const {
      title,
      priceKrw,
      category,
      description,
      mainImages,
      contentImages,
      variants,
    } = body as {
      title: string;
      priceKrw: number;
      category?: string;
      description?: string;
      mainImages: string[];
      contentImages?: string[];
      variants: { sizeLabel: string; stock: number }[];
    };

    // ---- Validation ----
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "상품명을 입력해주세요" }, { status: 400 });
    }
    if (typeof priceKrw !== "number" || priceKrw < 0) {
      return NextResponse.json({ error: "가격을 올바르게 입력해주세요" }, { status: 400 });
    }
    if (!mainImages || !Array.isArray(mainImages) || mainImages.length === 0) {
      return NextResponse.json({ error: "대표 이미지를 1장 이상 올려주세요" }, { status: 400 });
    }
    if (mainImages.length > 10) {
      return NextResponse.json({ error: "대표 이미지는 최대 10장입니다" }, { status: 400 });
    }
    if (contentImages && contentImages.length > 20) {
      return NextResponse.json({ error: "상세 이미지는 최대 20장입니다" }, { status: 400 });
    }
    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json({ error: "사이즈/재고를 1개 이상 입력해주세요" }, { status: 400 });
    }

    // Validate variants
    const seenLabels = new Set<string>();
    for (const v of variants) {
      const label = (v.sizeLabel || "").trim().toUpperCase();
      if (!label) {
        return NextResponse.json({ error: "사이즈명을 입력해주세요" }, { status: 400 });
      }
      if (seenLabels.has(label)) {
        return NextResponse.json({ error: `중복된 사이즈: ${label}` }, { status: 400 });
      }
      seenLabels.add(label);
      if (typeof v.stock !== "number" || v.stock < 0 || !Number.isInteger(v.stock)) {
        return NextResponse.json({ error: "재고는 0 이상 정수를 입력해주세요" }, { status: 400 });
      }
    }

    // ---- Transaction ----
    const product = await prisma.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: {
          sellerId,
          title: title.trim(),
          priceKrw,
          category: category?.trim() || null,
          description: description?.trim() || null,
          status: "ACTIVE",
        },
      });

      // Create MAIN images
      await tx.productImage.createMany({
        data: mainImages.map((url: string, i: number) => ({
          productId: p.id,
          url,
          kind: "MAIN" as const,
          sortOrder: i,
        })),
      });

      // Create CONTENT images
      if (contentImages && contentImages.length > 0) {
        await tx.productImage.createMany({
          data: contentImages.map((url: string, i: number) => ({
            productId: p.id,
            url,
            kind: "CONTENT" as const,
            sortOrder: i,
          })),
        });
      }

      // Create variants
      await tx.productVariant.createMany({
        data: variants.map((v) => ({
          productId: p.id,
          color: "FREE",
          sizeLabel: v.sizeLabel.trim().toUpperCase(),
          stock: v.stock,
        })),
      });

      return p;
    });

    return NextResponse.json({ id: product.id });
  } catch (err) {
    console.error("product creation error:", err);
    return NextResponse.json(
      { error: "상품 등록에 실패했습니다" },
      { status: 500 },
    );
  }
}
