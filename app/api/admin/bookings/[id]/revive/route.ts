import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createBookingEvent, calendar } from "@/lib/google-calendar";
import { sendIntimationEmail } from "@/lib/email";

const prisma = new PrismaClient();

const RESCHEDULE_POLICY_TEXT = `
---
RESCHEDULE POLICY:
You may request to reschedule this session exactly once.
Reschedule requests must be made at least 24 hours prior to the session start time and are subject to approval.
To request a reschedule, click this secure link:
https://echoinsight.in/reschedule?token=
`;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    // Parse Original Date & Time
    const [year, month, day] = booking.date.split("-").map(Number);
    const [timeVal, modifier] = booking.time.split(" ");
    let [hours, minutes] = timeVal.split(":").map(Number);
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    const istString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+05:30`;
    const startDateTime = new Date(istString);
    const durationMins = parseInt(booking.duration || "60");
    const endDateTime = new Date(startDateTime.getTime() + durationMins * 60000);

    // Check Google Calendar FreeBusy to ensure slot is still available
    const freebusyRes = await calendar.freebusy.query({
      requestBody: {
        timeMin: startDateTime.toISOString(),
        timeMax: endDateTime.toISOString(),
        timeZone: "Asia/Kolkata",
        items: [{ id: "primary" }],
      },
    });

    const busyBlocks = freebusyRes.data.calendars?.primary?.busy || [];
    if (busyBlocks.length > 0) {
      return NextResponse.json({ success: false, error: "SLOT_UNAVAILABLE" }, { status: 400 });
    }

    const description = `Session Revived.\n\nPatient Details:\nName: ${booking.salutation} ${booking.name}\nPhone: ${booking.mobile}\nRemarks: ${booking.remarks || "None"}\n${RESCHEDULE_POLICY_TEXT}${booking.rescheduleToken}`;

    const calendarRes = await createBookingEvent({
      patientEmail: booking.email,
      patientName: `${booking.salutation} ${booking.name}`,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      summary: `Echo & Insight: Session with ${booking.name}`,
      description,
    });

    let googleEventId = booking.googleEventId;
    if (calendarRes.success && calendarRes.eventId) {
      googleEventId = calendarRes.eventId;
    } else {
      console.error("Warning: Failed to recreate calendar event upon revival", calendarRes.error);
    }

    // Update DB
    await prisma.booking.update({
      where: { id },
      data: { 
        status: "CONFIRMED",
        googleEventId
      }
    });

    // Send custom revival intimation email via Nodemailer
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Booking Restored / Confirmed</h2>
        <p>Dear ${booking.salutation} ${booking.name},</p>
        <p>Great news! Your session on <strong>${booking.date}</strong> at <strong>${booking.time}</strong> has been successfully confirmed and restored to our schedule.</p>
        <p>You should also receive a Google Calendar invitation shortly containing the Google Meet link for the session.</p>
        <br />
        <p>Best regards,</p>
        <p><strong>Echo & Insight Support</strong></p>
      </div>
    `;

    await sendIntimationEmail({
      to: booking.email,
      subject: "Update: Your Session at Echo & Insight has been Restored",
      html: emailHtml,
    });

    return NextResponse.json({ success: true, message: "Booking revived successfully." });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
