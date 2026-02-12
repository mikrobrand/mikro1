import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

interface SimulatePaymentRequest {
  orderIds: string[];
}

/**
 * POST /api/payments/simulate
 * Simulate payment success with atomic stock deduction
 *
 * CRITICAL: This performs atomic stock deduction using updateMany with
 * WHERE stock >= quantity to prevent race conditions and overselling
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role === "SELLER") {
      return NextResponse.json(
        { error: "Sellers cannot simulate payment" },
        { status: 403 }
      );
    }

    const body = (await request.json()) as SimulatePaymentRequest;

    if (!body.orderIds || !Array.isArray(body.orderIds) || body.orderIds.length === 0) {
      return NextResponse.json(
        { error: "orderIds array is required" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const orders = [];

      for (const orderId of body.orderIds) {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: {
            items: {
              include: {
                product: true,
                variant: true,
              },
            },
            seller: {
              include: {
                sellerProfile: true,
              },
            },
            payment: true,
          },
        });

        if (!order) {
          throw new Error(`Order not found: ${orderId}`);
        }

        if (order.buyerId !== session.userId) {
          throw new Error(`Forbidden: Order ${orderId} does not belong to you`);
        }

        if (order.status === "PAID") {
          return { ok: true, alreadyPaid: true };
        }

        if (order.status !== "PENDING") {
          throw new Error(`Order ${orderId} is not in PENDING status`);
        }

        orders.push(order);
      }

      for (const order of orders) {
        for (const item of order.items) {
          if (!item.variant) {
            throw new Error(`Variant not found for order item ${item.id}`);
          }

          const result = await tx.productVariant.updateMany({
            where: {
              id: item.variant.id,
              stock: { gte: item.quantity },
            },
            data: {
              stock: { decrement: item.quantity },
            },
          });

          if (result.count === 0) {
            throw new Error(
              `OUT_OF_STOCK: ${item.product.title} (${item.variant.sizeLabel}): requested ${item.quantity}, insufficient stock`
            );
          }
        }

        let totalAmountKrw = 0;
        for (const item of order.items) {
          totalAmountKrw += item.unitPriceKrw * item.quantity;
        }

        const sellerProfile = order.seller.sellerProfile;
        const shippingFeeKrw = sellerProfile?.shippingFeeKrw || 3000;
        const freeShippingThreshold = sellerProfile?.freeShippingThreshold || 50000;

        let calculatedShippingFee = shippingFeeKrw;
        if (totalAmountKrw >= freeShippingThreshold) {
          calculatedShippingFee = 0;
        }

        const totalPayKrw = totalAmountKrw + calculatedShippingFee;

        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "PAID",
            totalAmountKrw,
            shippingFeeKrw: calculatedShippingFee,
            totalPayKrw,
          },
        });

        if (order.payment) {
          await tx.payment.update({
            where: { id: order.payment.id },
            data: {
              status: "DONE",
              approvedAt: new Date(),
            },
          });
        } else {
          await tx.payment.create({
            data: {
              orderId: order.id,
              status: "DONE",
              amountKrw: totalPayKrw,
              method: "TEST_SIMULATION",
              approvedAt: new Date(),
            },
          });
        }
      }

      return { ok: true, alreadyPaid: false };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message.includes("OUT_OF_STOCK")) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    if (error.message.includes("Forbidden")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    if (
      error.message.includes("not in PENDING status") ||
      error.message.includes("not found")
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Payment simulation failed" },
      { status: 500 }
    );
  }
}
