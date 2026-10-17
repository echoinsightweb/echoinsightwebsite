import { PrismaClient } from "@prisma/client";
import { createBookingEvent } from "@/lib/google-calendar";
import { sendIntimationEmail, generateIcsInvite, generateGoogleCalendarLink } from "@/lib/email";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

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

export async function fulfillBooking(bookingId: string, paymentData: any, rawPayload: any = null) {
  // 1. Atomic update to ensure we only fulfill once
  const updateResult = await prisma.booking.updateMany({
    where: { id: bookingId, paymentStatus: "PENDING" },
    data: {
      status: "CONFIRMED",
      paymentStatus: "SUCCESS",
      paymentReferenceId: paymentData?.cf_payment_id?.toString() || paymentData?.bank_reference,
      upiRrn: paymentData?.bank_reference,
      customerVpa: paymentData?.payment_method?.upi?.channel || paymentData?.payment_method?.upi?.upi_id,
      paymentRawResponse: rawPayload || paymentData,
    }
  });

  if (updateResult.count === 0) {
    // Already fulfilled by another process (webhook or polling)
    return { success: true, alreadyFulfilled: true };
  }

  // Fetch the booking to get details for emails/calendar
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return { success: false, error: "Booking not found after update" };

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
  
  const meetLink = calendarRes.meetLink || "";
  const googleCalendarUrl = generateGoogleCalendarLink({
    title: `Echo & Insight: ${booking.duration}-min Counselling Session`,
    description: `Counselling Session with Echo & Insight.\nService: ${booking.serviceType || "Counselling"}\n${RESCHEDULE_POLICY_TEXT}${booking.rescheduleToken}`,
    meetLink,
    startTime: startDateTime,
    endTime: endDateTime,
  });

  const icsInvite = generateIcsInvite({
    title: `Echo & Insight: ${booking.duration}-min Counselling Session`,
    description: `Counselling Session with Echo & Insight.\nService: ${booking.serviceType || "Counselling"}\n${meetLink ? `Join Meet: ${meetLink}\n` : ""}${RESCHEDULE_POLICY_TEXT}${booking.rescheduleToken}`,
    meetLink,
    startTime: startDateTime,
    endTime: endDateTime,
    attendeeEmail: booking.email,
    attendeeName: `${booking.salutation} ${booking.name}`,
  });

  // Notifications
  const patientEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
      <h2 style="color: #0f766e; margin-bottom: 8px;">Your Session is Confirmed!</h2>
      <p>Dear ${booking.salutation} ${booking.name},</p>
      <p>Your payment is successful and your ${booking.duration}-minute session has been confirmed.</p>
      
      <div style="background: #f8fafc; border-left: 4px solid #0d9488; padding: 14px 18px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 4px 0;"><strong>📅 Date:</strong> ${booking.date}</p>
        <p style="margin: 4px 0;"><strong>⏰ Time:</strong> ${booking.time} (IST)</p>
        <p style="margin: 4px 0;"><strong>⏱️ Duration:</strong> ${booking.duration} Minutes</p>
        <p style="margin: 4px 0;"><strong>💼 Service:</strong> ${booking.serviceType || "Counselling Session"}</p>
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
        A calendar invitation (.ics) is also attached to this email. You can open it to automatically add this session to your calendar.
      </p>
      
      <p style="font-size: 13px; color: #64748b;">
        Need to reschedule? You may request to reschedule up to 24 hours before your session: <a href="https://echoinsight.in/reschedule?token=${booking.rescheduleToken}" style="color: #0d9488;">Reschedule Session</a>
      </p>
    </div>
  `;
  
  await sendIntimationEmail({
    to: booking.email,
    subject: "Echo & Insight: Session Confirmed",
    html: patientEmailHtml,
    icalEvent: {
      filename: "echoinsight-session.ics",
      method: "REQUEST",
      content: icsInvite,
    },
  }).catch(console.error);
  
  const adminEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
      <h2 style="color: #0f766e; margin-bottom: 8px;">New Paid Session Confirmed</h2>
      <p><strong>Patient:</strong> ${booking.salutation} ${booking.name}</p>
      <p><strong>Email:</strong> ${booking.email}</p>
      <p><strong>Mobile:</strong> ${booking.mobile}</p>
      <p><strong>Date:</strong> ${booking.date}</p>
      <p><strong>Time:</strong> ${booking.time} (IST)</p>
      <p><strong>Amount Paid:</strong> ₹${booking.amount ? booking.amount / 100 : 0}</p>
      <p><strong>Service:</strong> ${booking.serviceType || "Counselling"}</p>
      ${meetLink ? `<p><strong>Google Meet Link:</strong> <a href="${meetLink}">${meetLink}</a></p>` : ''}
      <div style="margin: 16px 0;">
        <a href="${googleCalendarUrl}" target="_blank" style="display: inline-block; background: #0d9488; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px;">View on Google Calendar</a>
      </div>
    </div>
  `;
  await sendIntimationEmail({
    to: ADMIN_EMAIL,
    subject: `Paid Booking: ${booking.name}`,
    html: adminEmailHtml,
    icalEvent: {
      filename: "echoinsight-session.ics",
      method: "REQUEST",
      content: icsInvite,
    },
  }).catch(console.error);

  const patientWaText = `Hi ${booking.name}, your Paid Session at Echo & Insight is confirmed for ${booking.date} at ${booking.time}. Check your email for the meet link.`;
  const adminWaText = `Echo & Insight Alert\nPaid Session Confirmed: ${booking.name}\n${booking.date} at ${booking.time}\nMobile: ${booking.mobile}`;
  
  await sendWhatsAppMessage(booking.mobile, patientWaText).catch(console.error);
  await sendWhatsAppMessage(ADMIN_WHATSAPP, adminWaText).catch(console.error);

  return { success: true, alreadyFulfilled: false };
}
