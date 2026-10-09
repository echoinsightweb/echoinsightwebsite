import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendIntimationEmail } from "@/lib/email";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

const prisma = new PrismaClient();
const ADMIN_EMAIL = process.env.SMTP_USER || "echoinsightsupport@gmail.com";
const ADMIN_WHATSAPP = process.env.ADMIN_WHATSAPP || "+919999999999";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { token, mobile, newDate, newTime } = data;

    if (!token || !mobile || !newDate || !newTime) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { rescheduleToken: token }
    });

    if (!booking || booking.mobile !== mobile) {
      return NextResponse.json({ success: false, error: "Authentication failed" }, { status: 403 });
    }

    if (booking.rescheduleCount >= 1) {
      return NextResponse.json({ success: false, error: "This booking has already been rescheduled once." }, { status: 403 });
    }

    // Save request to DB
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        rescheduleStatus: "REQUESTED",
        rescheduleRequestedDate: newDate,
        rescheduleRequestedTime: newTime,
      }
    });

    // Trigger email alert to the admin about the new request
    const adminEmailHtml = `<p><strong>Reschedule Request Submitted</strong></p>
      <p><strong>Patient:</strong> ${booking.name}</p>
      <p><strong>Mobile:</strong> ${booking.mobile}</p>
      <p><strong>Original Session:</strong> ${booking.date} at ${booking.time}</p>
      <p><strong>Requested New Session:</strong> ${newDate} at ${newTime}</p>
      <p>Please review and approve via the Admin Dashboard.</p>`;
    
    await sendIntimationEmail({ to: ADMIN_EMAIL, subject: `Reschedule Request: ${booking.name}`, html: adminEmailHtml });
    
    const adminWaText = `Echo & Insight Alert\nReschedule Request from ${booking.name}\nOriginal: ${booking.date} at ${booking.time}\nRequested: ${newDate} at ${newTime}`;
    await sendWhatsAppMessage(ADMIN_WHATSAPP, adminWaText);
    return NextResponse.json({ success: true, message: "Request submitted" });

  } catch (error) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
