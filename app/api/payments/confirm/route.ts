import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * POST /api/payments/confirm
 *
 * Confirms a payment for an order, atomically deducting stock.
 * Body: { orderId: string, paymentKey?: string }
 *
 * Flow (all inside a single Prisma transaction):
 *   1. Verify the order exists and status is PENDING (PENDING_PAYMENT).
 *   2. For each order item, atomically decrement stock only if enough.
 *   3. If stock decrement succeeds → mark order as PAID, update payment.
 *   4. If stock decrement fails → mark order as CANCELED, return error.
 *
 * Idempotency: If order is already PAID, return success without touching stock.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, paymentKey } = body as {
      orderId: string;
      paymentKey?: string;
    };

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch the order with items
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          payment: true,
        },
      });

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      // Idempotency: already PAID → return success
      if (order.status === "PAID") {
        return { status: "already_paid", orderId: order.id };
      }

      // Only allow confirming PENDING orders
      if (order.status !== "PENDING") {
        throw new Error("INVALID_ORDER_STATUS");
      }

      // 2. Atomically decrement stock for each order item
      for (const item of order.items) {
        if (!item.variantId) {
          // If no variant linked, try to find the default variant for the product
          const defaultVariant = await tx.productVariant.findFirst({
            where: { productId: item.productId },
          });

          if (!defaultVariant) {
            throw new Error("VARIANT_NOT_FOUND");
          }

          // Atomic decrement: only if enough stock
          const result = await tx.productVariant.updateMany({
            where: {
              id: defaultVariant.id,
              stock: { gte: item.quantity },
            },
            data: {
              stock: { decrement: item.quantity },
            },
          });

          if (result.count !== 1) {
            throw new Error("OUT_OF_STOCK");
          }
        } else {
          // Atomic decrement: only if enough stock
          const result = await tx.productVariant.updateMany({
            where: {
              id: item.variantId,
              stock: { gte: item.quantity },
            },
            data: {
              stock: { decrement: item.quantity },
            },
          });

          if (result.count !== 1) {
            throw new Error("OUT_OF_STOCK");
          }
        }
      }

      // 3. Update order status to PAID
      await tx.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      });

      // 4. Update payment record
      if (order.payment) {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: {
            status: "CONFIRMED",
            paymentKey: paymentKey || order.payment.paymentKey,
            approvedAt: new Date(),
          },
        });
      }

      return { status: "confirmed", orderId: order.id };
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "UNKNOWN_ERROR";

    // Handle specific error cases
    if (message === "ORDER_NOT_FOUND") {
      return NextResponse.json({ error: "주문을 찾을 수 없습니다" }, { status: 404 });
    }
    if (message === "INVALID_ORDER_STATUS") {
      return NextResponse.json({ error: "결제 확인이 불가능한 주문 상태입니다" }, { status: 400 });
    }
    if (message === "OUT_OF_STOCK") {
      // Optionally mark the order as failed
      try {
        const { orderId } = await req.clone().json();
        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: { status: "CANCELED" },
          });
        }
      } catch {
        // Best-effort: don't fail the response if this cleanup fails
      }
      return NextResponse.json({ error: "재고가 부족합니다 (품절)" }, { status: 409 });
    }
    if (message === "VARIANT_NOT_FOUND") {
      return NextResponse.json({ error: "상품 옵션을 찾을 수 없습니다" }, { status: 400 });
    }

    console.error("payment confirm error:", err);
    return NextResponse.json({ error: "결제 확인에 실패했습니다" }, { status: 500 });
  }
}
