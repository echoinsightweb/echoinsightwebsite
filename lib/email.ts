import nodemailer from "nodemailer";

// Using Gmail as the default provider for Echo & Insight
// Important: Requires an App Password from the Google Account, not the normal password.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || "echoinsightsupport@gmail.com",
    pass: process.env.SMTP_PASS || "", // Need an App Password here
  },
});

export interface IcsInviteOptions {
  title: string;
  description: string;
  meetLink?: string;
  startTime: Date | string;
  endTime: Date | string;
  organizerEmail?: string;
  organizerName?: string;
  attendeeEmail: string;
  attendeeName: string;
}

export function generateIcsInvite({
  title,
  description,
  meetLink,
  startTime,
  endTime,
  organizerEmail = "echoinsightsupport@gmail.com",
  organizerName = "Echo & Insight",
  attendeeEmail,
  attendeeName,
}: IcsInviteOptions): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  const formatUtc = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Echo & Insight//Counselling Session//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:booking-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@echoinsight.in`,
    `DTSTAMP:${formatUtc(now)}`,
    `DTSTART:${formatUtc(start)}`,
    `DTEND:${formatUtc(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
    meetLink ? `LOCATION:${meetLink}` : "LOCATION:Online via Google Meet",
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    `ORGANIZER;CN=${organizerName}:mailto:${organizerEmail}`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=${attendeeName}:mailto:${attendeeEmail}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Session Reminder",
    "TRIGGER:-PT15M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function generateGoogleCalendarLink({
  title,
  description,
  meetLink,
  startTime,
  endTime,
}: {
  title: string;
  description: string;
  meetLink?: string;
  startTime: Date | string;
  endTime: Date | string;
}): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const formatUtc = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  
  const dates = `${formatUtc(start)}/${formatUtc(end)}`;
  const fullDesc = `${description}${meetLink ? `\n\nGoogle Meet: ${meetLink}` : ""}`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: dates,
    details: fullDesc,
    location: meetLink || "Online via Google Meet",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export async function sendIntimationEmail({
  to,
  subject,
  html,
  icalEvent,
}: {
  to: string;
  subject: string;
  html: string;
  icalEvent?: {
    filename?: string;
    method?: string;
    content: string;
  };
}) {
  try {
    if (!process.env.SMTP_PASS) {
      console.warn("SMTP_PASS is not configured. Email will not be sent.");
      return { success: false, error: "SMTP credentials missing" };
    }

    const mailOptions: any = {
      from: '"Echo & Insight" <echoinsightsupport@gmail.com>',
      to,
      subject,
      html,
    };

    if (icalEvent) {
      mailOptions.icalEvent = {
        filename: icalEvent.filename || "session-invite.ics",
        method: icalEvent.method || "REQUEST",
        content: icalEvent.content,
      };
    }

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
