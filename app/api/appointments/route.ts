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
    const data = await req.json();
    const isFree = data.sessionType === "free";
    
    // Generate secure reschedule token
    const rescheduleToken = crypto.randomUUID();
    
    // Parse Date & Time
    const [year, month, day] = data.date.split("-").map(Number);
    const [timeVal, modifier] = data.time.split(" ");
    let [hours, minutes] = timeVal.split(":").map(Number);
    
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    const istString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+05:30`;
    const startDateTime = new Date(istString);
    const durationMins = isFree ? 15 : (parseInt(data.duration) || 60);
    const endDateTime = new Date(startDateTime.getTime() + durationMins * 60000);
    
    const startTimeISO = startDateTime.toISOString();
    const endTimeISO = endDateTime.toISOString();

    // 1. Save to Database
    const booking = await prisma.booking.create({
      data: {
        sessionType: data.sessionType,
        salutation: data.salutation,
        name: data.name,
        mobile: data.mobile,
        email: data.email,
        state: data.state,
        district: data.district,
        serviceType: data.serviceType || "Introductory Session",
        duration: durationMins.toString(),
        date: data.date,
        time: data.time,
        remarks: data.remarks,
        status: isFree ? "CONFIRMED" : "PENDING",
        paymentStatus: isFree ? "NOT_APPLICABLE" : "PENDING",
        amount: isFree ? 0 : data.duration === "90" ? 200000 : 150000,
        rescheduleToken,
      }
    });

    // 2. If it's a Free Session, immediately block calendar and trigger email
    if (isFree) {
      const description = `Introductory Session booked via Website.\n\nPatient Details:\nName: ${data.salutation} ${data.name}\nPhone: ${data.mobile}\nRemarks: ${data.remarks || "None"}\n${RESCHEDULE_POLICY_TEXT}${rescheduleToken}`;
      
      const calendarRes = await createBookingEvent({
        patientEmail: data.email,
        patientName: `${data.salutation} ${data.name}`,
        startTime: startTimeISO,
        endTime: endTimeISO,
        summary: `Echo & Insight: Free Session with ${data.name}`,
        description,
      });

      if (calendarRes.success && calendarRes.eventId) {
        // Save Google Event ID back to booking for future overrides
        await prisma.booking.update({
          where: { id: booking.id },
          data: { googleEventId: calendarRes.eventId }
        });
      } else {
        console.error("Failed to sync free session to calendar:", calendarRes.error);
      }
      
      // Notifications
      const patientEmailHtml = `<p>Dear ${data.salutation} ${data.name},</p>
        <p>Your Free 15-minute Introductory Session has been confirmed.</p>
        <p><strong>Date:</strong> ${data.date}</p>
        <p><strong>Time:</strong> ${data.time}</p>
        <p>A Google Calendar invite with the meeting link has been sent to this email.</p>
        <p>If you need to reschedule, please use this link: <a href="https://echoinsight.in/reschedule?token=${rescheduleToken}">Reschedule</a></p>`;
      
      await sendIntimationEmail({ to: data.email, subject: "Echo & Insight: Session Confirmed", html: patientEmailHtml });
      
      const adminEmailHtml = `<p>New Free Session Booked.</p>
        <p><strong>Name:</strong> ${data.salutation} ${data.name}</p>
        <p><strong>Mobile:</strong> ${data.mobile}</p>
        <p><strong>Time:</strong> ${data.date} at ${data.time}</p>`;
      await sendIntimationEmail({ to: ADMIN_EMAIL, subject: `New Booking: ${data.name}`, html: adminEmailHtml });

      const patientWaText = `Hi ${data.name}, your Free Introductory Session at Echo & Insight is confirmed for ${data.date} at ${data.time}. Check your email for the meet link.`;
      const adminWaText = `Echo & Insight Alert\nNew Free Session: ${data.name}\n${data.date} at ${data.time}\nMobile: ${data.mobile}`;
      
      await sendWhatsAppMessage(data.mobile, patientWaText);
      await sendWhatsAppMessage(ADMIN_WHATSAPP, adminWaText);
      
      return NextResponse.json({
        success: true,
        bookingId: booking.id,
        meetLink: calendarRes.meetLink,
        message: "Free session booked and calendar invite sent.",
      });
    }

    // 3. If it's a Paid Session, return order initialization
    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      paymentOrderId: `mock_order_${Date.now()}`,
      message: "Booking pending payment.",
    });

  } catch (error) {
    console.error("Error processing booking:", error);
    return NextResponse.json({ success: false, error: "Failed to process booking" }, { status: 500 });
  }
}
