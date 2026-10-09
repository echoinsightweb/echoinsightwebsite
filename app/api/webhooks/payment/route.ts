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
    const secret = process.env.PAYMENT_WEBHOOK_SECRET;

    if (!secret) {
      console.warn("PAYMENT_WEBHOOK_SECRET is not configured. Skipping signature verification.");
    } else if (signature) {
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");
        
      if (signature !== expectedSignature) {
         return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 401 });
      }
    }

    const data = JSON.parse(rawBody);
    
    // Simulate payment success event validation
    const { bookingId, paymentStatus, paymentReferenceId, upiRrn, customerVpa, rawResponse } = data;

    if (paymentStatus !== "SUCCESS") {
      return NextResponse.json({ success: true, message: "Ignored non-success webhook" });
    }

    // 1. Fetch current booking to ensure it exists and get its details
    const existingBooking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!existingBooking) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    // 2. Update Booking Status
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        paymentStatus: "SUCCESS",
        paymentReferenceId,
        upiRrn,
        customerVpa,
        paymentRawResponse: rawResponse || {},
      },
    });

    // 3. Parse Date & Time for Calendar
    const [year, month, day] = booking.date.split("-").map(Number);
    const [timeVal, modifier] = booking.time.split(" ");
    let [hours, minutes] = timeVal.split(":").map(Number);
    
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    const startDateTime = new Date(year, month - 1, day, hours, minutes);
    const durationMins = parseInt(booking.duration || "60");
    const endDateTime = new Date(startDateTime.getTime() + durationMins * 60000);
    
    const startTimeISO = startDateTime.toISOString();
    const endTimeISO = endDateTime.toISOString();

    const description = `Paid Session (${booking.duration} mins) booked via Website.\n\nPatient Details:\nName: ${booking.salutation} ${booking.name}\nPhone: ${booking.mobile}\nService: ${booking.serviceType}\nRemarks: ${booking.remarks || "None"}\n${RESCHEDULE_POLICY_TEXT}${booking.rescheduleToken}`;

    // 4. Create Google Calendar Event
    const calendarRes = await createBookingEvent({
      patientEmail: booking.email,
      patientName: `${booking.salutation} ${booking.name}`,
      startTime: startTimeISO,
      endTime: endTimeISO,
      summary: `Echo & Insight: Paid Session with ${booking.name}`,
      description,
    });

    if (calendarRes.success && calendarRes.eventId) {
       await prisma.booking.update({
          where: { id: booking.id },
          data: { googleEventId: calendarRes.eventId }
       });
    } else {
      console.error("Failed to sync paid session to calendar:", calendarRes.error);
    }
    
    // Notifications
    const patientEmailHtml = `<p>Dear ${booking.salutation} ${booking.name},</p>
      <p>Your payment is successful and your ${booking.duration}-minute session has been confirmed.</p>
      <p><strong>Date:</strong> ${booking.date}</p>
      <p><strong>Time:</strong> ${booking.time}</p>
      <p>A Google Calendar invite with the meeting link has been sent to this email.</p>
      <p>If you need to reschedule, please use this link: <a href="https://echoinsight.in/reschedule?token=${booking.rescheduleToken}">Reschedule</a></p>`;
    
    await sendIntimationEmail({ to: booking.email, subject: "Echo & Insight: Session Confirmed", html: patientEmailHtml });
    
    const adminEmailHtml = `<p>New Paid Session Confirmed.</p>
      <p><strong>Name:</strong> ${booking.salutation} ${booking.name}</p>
      <p><strong>Mobile:</strong> ${booking.mobile}</p>
      <p><strong>Time:</strong> ${booking.date} at ${booking.time}</p>
      <p><strong>Amount:</strong> ₹${booking.amount ? booking.amount / 100 : 0}</p>`;
    await sendIntimationEmail({ to: ADMIN_EMAIL, subject: `Paid Booking: ${booking.name}`, html: adminEmailHtml });

    const patientWaText = `Hi ${booking.name}, your Paid Session at Echo & Insight is confirmed for ${booking.date} at ${booking.time}. Check your email for the meet link.`;
    const adminWaText = `Echo & Insight Alert\nPaid Session Confirmed: ${booking.name}\n${booking.date} at ${booking.time}\nMobile: ${booking.mobile}`;
    
    await sendWhatsAppMessage(booking.mobile, patientWaText);
    await sendWhatsAppMessage(ADMIN_WHATSAPP, adminWaText);

    return NextResponse.json({
      success: true,
      message: "Payment confirmed, booking updated, and calendar invite sent.",
    });

  } catch (error) {
    console.error("Error processing payment webhook:", error);
    return NextResponse.json({ success: false, error: "Webhook processing failed" }, { status: 500 });
  }
}
