import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createBookingEvent } from "@/lib/google-calendar";
import { sendIntimationEmail, generateIcsInvite, generateGoogleCalendarLink } from "@/lib/email";
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
      
      const meetLink = calendarRes.meetLink || "";
      const googleCalendarUrl = generateGoogleCalendarLink({
        title: "Echo & Insight: Free 15-min Introductory Session",
        description: `Introductory Session with Echo & Insight.\n${RESCHEDULE_POLICY_TEXT}${rescheduleToken}`,
        meetLink,
        startTime: startDateTime,
        endTime: endDateTime,
      });

      const icsInvite = generateIcsInvite({
        title: "Echo & Insight: Free 15-min Introductory Session",
        description: `Introductory Session with Echo & Insight.\n${meetLink ? `Join Meet: ${meetLink}\n` : ""}${RESCHEDULE_POLICY_TEXT}${rescheduleToken}`,
        meetLink,
        startTime: startDateTime,
        endTime: endDateTime,
        attendeeEmail: data.email,
        attendeeName: `${data.salutation} ${data.name}`,
      });

      // Notifications
      const patientEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
          <h2 style="color: #0f766e; margin-bottom: 8px;">Your Session is Confirmed!</h2>
          <p>Dear ${data.salutation} ${data.name},</p>
          <p>Your Free 15-minute Introductory Session with Echo & Insight has been confirmed.</p>
          
          <div style="background: #f8fafc; border-left: 4px solid #0d9488; padding: 14px 18px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 4px 0;"><strong>📅 Date:</strong> ${data.date}</p>
            <p style="margin: 4px 0;"><strong>⏰ Time:</strong> ${data.time} (IST)</p>
            <p style="margin: 4px 0;"><strong>⏱️ Duration:</strong> 15 Minutes</p>
          </div>

          ${meetLink ? `
          <div style="background: #f0fdfa; border: 1px solid #14b8a6; padding: 16px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #0f766e; font-size: 15px;">Google Meet Video Consultation Link:</p>
            <a href="${meetLink}" target="_blank" style="display: inline-block; background: #0d9488; color: #ffffff; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 14px;">Join Google Meet</a>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #64748b;">${meetLink}</p>
          </div>
          ` : ''}

          <div style="margin: 20px 0; text-align: center;">
            <a href="${googleCalendarUrl}" target="_blank" style="display: inline-block; background: #ffffff; color: #0f766e; border: 1px solid #0f766e; padding: 10px 20px; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 13px;">📅 Add to Google Calendar</a>
          </div>

          <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
            A calendar invitation (.ics) is also attached to this email. You can open it to automatically add this session to Apple Calendar, Outlook, or Google Calendar.
          </p>
          
          <p style="font-size: 13px; color: #64748b;">
            Need to reschedule? You may request to reschedule up to 24 hours before your session: <a href="https://echoinsight.in/reschedule?token=${rescheduleToken}" style="color: #0d9488;">Reschedule Session</a>
          </p>
        </div>
      `;
      
      await sendIntimationEmail({
        to: data.email,
        subject: "Echo & Insight: Free Session Confirmed",
        html: patientEmailHtml,
        icalEvent: {
          filename: "echoinsight-session.ics",
          method: "REQUEST",
          content: icsInvite,
        },
      });
      
      const adminEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
          <h2 style="color: #0f766e; margin-bottom: 8px;">New Free Session Booked</h2>
          <p><strong>Patient:</strong> ${data.salutation} ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Mobile:</strong> ${data.mobile}</p>
          <p><strong>Date:</strong> ${data.date}</p>
          <p><strong>Time:</strong> ${data.time} (IST)</p>
          <p><strong>Remarks:</strong> ${data.remarks || "None"}</p>
          ${meetLink ? `<p><strong>Google Meet Link:</strong> <a href="${meetLink}">${meetLink}</a></p>` : ''}
          <div style="margin: 16px 0;">
            <a href="${googleCalendarUrl}" target="_blank" style="display: inline-block; background: #0d9488; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px;">View / Add to Google Calendar</a>
          </div>
        </div>
      `;
      await sendIntimationEmail({
        to: ADMIN_EMAIL,
        subject: `New Booking: ${data.name}`,
        html: adminEmailHtml,
        icalEvent: {
          filename: "echoinsight-session.ics",
          method: "REQUEST",
          content: icsInvite,
        },
      });

      const patientWaText = `Hi ${data.name}, your Free Introductory Session at Echo & Insight is confirmed for ${data.date} at ${data.time}.${meetLink ? ` Google Meet: ${meetLink}` : ' Check your email for details.'}`;
      const adminWaText = `Echo & Insight Alert\nNew Free Session: ${data.name}\n${data.date} at ${data.time}\nMobile: ${data.mobile}${meetLink ? `\nMeet: ${meetLink}` : ''}`;
      
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
