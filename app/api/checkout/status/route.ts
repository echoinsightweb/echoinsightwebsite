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

    return NextResponse.json({ success: true, status: booking.paymentStatus });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}
