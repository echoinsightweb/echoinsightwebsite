import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendIntimationEmail } from "@/lib/email";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

const prisma = new PrismaClient();
const ADMIN_EMAIL = process.env.SMTP_USER || "echoinsightsupport@gmail.com";
const ADMIN_WHATSAPP = process.env.ADMIN_WHATSAPP || "+919999999999";

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Ensure we are working with IST timezone for logical comparisons
    const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    
    // We check for bookings between now + 15 mins and now + 30 mins
    const windowStart = new Date(nowIST.getTime() + 15 * 60000);
    const windowEnd = new Date(nowIST.getTime() + 30 * 60000);

    const year = nowIST.getFullYear();
    const month = String(nowIST.getMonth() + 1).padStart(2, "0");
    const day = String(nowIST.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;

    // Also check tomorrow in case the 30-min window crosses midnight
    const tomorrow = new Date(nowIST.getTime() + 24 * 60 * 60000);
    const tYear = tomorrow.getFullYear();
    const tMonth = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const tDay = String(tomorrow.getDate()).padStart(2, "0");
    const tomorrowStr = `${tYear}-${tMonth}-${tDay}`;

    const bookings = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        date: { in: [todayStr, tomorrowStr] }
      }
    });

    let remindersSent = 0;

    for (const booking of bookings) {
      const [y, m, d] = booking.date.split("-").map(Number);
      const [timeVal, modifier] = booking.time.split(" ");
      let [hours, minutes] = timeVal.split(":").map(Number);
      
      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      const bookingTimeIST = new Date(y, m - 1, d, hours, minutes);

      if (bookingTimeIST > windowStart && bookingTimeIST <= windowEnd) {
        // Send Patient Reminder
        const patientEmailHtml = `<p>Dear ${booking.salutation} ${booking.name},</p>
          <p>This is a reminder that your session at Echo & Insight will start in 30 minutes.</p>
          <p><strong>Time:</strong> ${booking.time}</p>
          <p>Please check your Google Calendar for the meeting link.</p>`;
        
        await sendIntimationEmail({ to: booking.email, subject: "Reminder: Session in 30 minutes", html: patientEmailHtml });

        const patientWaText = `Hi ${booking.name}, your session at Echo & Insight will start in 30 minutes (${booking.time}). Please join via the link in your email/calendar.`;
        await sendWhatsAppMessage(booking.mobile, patientWaText);

        // Send Admin Reminder
        const adminEmailHtml = `<p><strong>Upcoming Session Reminder</strong></p>
          <p>You have a session starting in 30 minutes.</p>
          <p><strong>Patient:</strong> ${booking.name}</p>
          <p><strong>Mobile:</strong> ${booking.mobile}</p>
          <p><strong>Time:</strong> ${booking.time}</p>`;
        await sendIntimationEmail({ to: ADMIN_EMAIL, subject: `Reminder: Session with ${booking.name}`, html: adminEmailHtml });

        const adminWaText = `Echo & Insight Reminder\nSession in 30 mins\nPatient: ${booking.name}\nTime: ${booking.time}\nMobile: ${booking.mobile}`;
        await sendWhatsAppMessage(ADMIN_WHATSAPP, adminWaText);

        remindersSent++;
      }
    }

    return NextResponse.json({ success: true, remindersSent });

  } catch (error) {
    console.error("Error sending reminders:", error);
    return NextResponse.json({ success: false, error: "Failed to send reminders" }, { status: 500 });
  }
}
