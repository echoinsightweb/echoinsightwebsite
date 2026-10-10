import { PrismaClient } from "@prisma/client";
import { createBookingEvent } from "@/lib/google-calendar";
import { sendIntimationEmail } from "@/lib/email";
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
  
  // Notifications
  const patientEmailHtml = `<p>Dear ${booking.salutation} ${booking.name},</p>
    <p>Your payment is successful and your ${booking.duration}-minute session has been confirmed.</p>
    <p><strong>Date:</strong> ${booking.date}</p>
    <p><strong>Time:</strong> ${booking.time}</p>
    <p>A Google Calendar invite with the meeting link has been sent to this email.</p>
    <p>If you need to reschedule, please use this link: <a href="https://echoinsight.in/reschedule?token=${booking.rescheduleToken}">Reschedule</a></p>`;
  
  await sendIntimationEmail({ to: booking.email, subject: "Echo & Insight: Session Confirmed", html: patientEmailHtml }).catch(console.error);
  
  const adminEmailHtml = `<p>New Paid Session Confirmed.</p>
    <p><strong>Name:</strong> ${booking.salutation} ${booking.name}</p>
    <p><strong>Mobile:</strong> ${booking.mobile}</p>
    <p><strong>Time:</strong> ${booking.date} at ${booking.time}</p>
    <p><strong>Amount:</strong> ₹${booking.amount ? booking.amount / 100 : 0}</p>`;
  await sendIntimationEmail({ to: ADMIN_EMAIL, subject: `Paid Booking: ${booking.name}`, html: adminEmailHtml }).catch(console.error);

  const patientWaText = `Hi ${booking.name}, your Paid Session at Echo & Insight is confirmed for ${booking.date} at ${booking.time}. Check your email for the meet link.`;
  const adminWaText = `Echo & Insight Alert\nPaid Session Confirmed: ${booking.name}\n${booking.date} at ${booking.time}\nMobile: ${booking.mobile}`;
  
  await sendWhatsAppMessage(booking.mobile, patientWaText).catch(console.error);
  await sendWhatsAppMessage(ADMIN_WHATSAPP, adminWaText).catch(console.error);

  return { success: true, alreadyFulfilled: false };
}
