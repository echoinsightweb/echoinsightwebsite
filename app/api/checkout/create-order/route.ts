import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Cashfree } from "@/lib/cashfree";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json();
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });

    const customer_details = {
      customer_id: booking.mobile.replace(/[^0-9]/g, '').substring(0, 10),
      customer_phone: booking.mobile.replace(/[^0-9]/g, '').substring(0, 10),
      customer_email: booking.email,
      customer_name: booking.name,
    };

    const order_meta = {
      return_url: `${process.env.NEXTAUTH_URL}/book/status?order_id={order_id}`,
      notify_url: `${process.env.NEXTAUTH_URL}/api/webhooks/payment`,
    };

    const request = {
      order_amount: (booking.amount || 0) / 100, // Amount in rupees
      order_currency: "INR",
      customer_details,
      order_meta,
      order_tags: {
        bookingId: booking.id,
      }
    };

    const response = await Cashfree.PGCreateOrder(request as any);
    const order = response.data;
    
    await prisma.booking.update({
      where: { id: bookingId },
      data: { paymentOrderId: order.order_id }
    });

    return NextResponse.json({
      success: true,
      paymentSessionId: order.payment_session_id,
      orderId: order.order_id,
    });
  } catch (error: any) {
    console.error("Error creating Cashfree order:", error.response?.data || error.message);
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 });
  }
}
