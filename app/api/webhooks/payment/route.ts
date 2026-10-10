import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createBookingEvent } from "@/lib/google-calendar";
import { sendIntimationEmail } from "@/lib/email";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import crypto from "crypto";

const prisma = new PrismaClient();
const ADMIN_EMAIL = process.env.SMTP_USER || "echoinsightsupport@gmail.com";
const ADMIN_WHATSAPP = process.env.ADMIN_WHATSAPP || "+919999999999";

const RESCHEDULE_POLICY_TEXT = `
---
RESCHEDULE POLICY:
You may request to reschedule this session exactly once.
Reschedule requests must be made at least 24 hours prior to the session start time and are subject to approval.
To request a reschedule, click this secure link:
https://echoinsight.in/reschedule?token=
`;

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-webhook-signature");
    const timestamp = req.headers.get("x-webhook-timestamp");
    const secret = process.env.CASHFREE_SECRET_KEY;

    if (secret && signature && timestamp) {
      const data = timestamp + rawBody;
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(data)
        .digest("base64");
        
      if (signature !== expectedSignature) {
         return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 401 });
      }
    } else if (secret) {
       return NextResponse.json({ success: false, message: "Missing signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    
    if (payload.type !== "PAYMENT_SUCCESS_WEBHOOK") {
      return NextResponse.json({ success: true, message: "Ignored non-success webhook" });
    }

    const order_id = payload.data?.order?.order_id;
    const payment = payload.data?.payment;

    if (!order_id || !payment) {
      return NextResponse.json({ success: false, message: "Invalid payload format" }, { status: 400 });
    }

    // 1. Fetch current booking
    const existingBooking = await prisma.booking.findFirst({ where: { paymentOrderId: order_id } });
    if (!existingBooking) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    const { fulfillBooking } = await import("@/lib/fulfillment");
    const result = await fulfillBooking(existingBooking.id, payment, payload);

    return NextResponse.json({
      success: true,
      message: result.alreadyFulfilled ? "Already fulfilled" : "Payment confirmed, booking updated, and calendar invite sent.",
    });

  } catch (error) {
    console.error("Error processing payment webhook:", error);
    return NextResponse.json({ success: false, error: "Webhook processing failed" }, { status: 500 });
  }
}
