import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("order_id");

  if (!orderId) {
    return NextResponse.json({ success: false, error: "Order ID required" }, { status: 400 });
  }

  try {
    const booking = await prisma.booking.findFirst({
      where: { paymentOrderId: orderId }
    });

    if (!booking) {
      return NextResponse.json({ success: false, status: "NOT_FOUND" });
    }

    if (booking.paymentStatus === "PENDING") {
      try {
        const { Cashfree } = await import("@/lib/cashfree");
        const response = await Cashfree.PGFetchOrder(orderId);
        const orderStatus = response.data.order_status;

        
        if (orderStatus === "PAID") {
          // Fetch payment details to capture UPI RRN and VPA
          const paymentsRes = await Cashfree.PGOrderFetchPayments(orderId);
          const paymentData = paymentsRes?.data?.[0] || {};
          
          const { fulfillBooking } = await import("@/lib/fulfillment");
          await fulfillBooking(booking.id, paymentData);

          return NextResponse.json({ success: true, status: "SUCCESS" });
        } else if (orderStatus === "EXPIRED" || orderStatus === "TERMINATED") {
          await prisma.booking.updateMany({
            where: { id: booking.id, paymentStatus: "PENDING" },
            data: { paymentStatus: "FAILED" }
          });
          return NextResponse.json({ success: true, status: "FAILED" });
        }
      } catch (e) {
        console.error("Error verifying with cashfree:", e);
      }
    }

    return NextResponse.json({ success: true, status: booking.paymentStatus });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}
