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

export async function sendIntimationEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    if (!process.env.SMTP_PASS) {
      console.warn("SMTP_PASS is not configured. Email will not be sent.");
      return { success: false, error: "SMTP credentials missing" };
    }

    const info = await transporter.sendMail({
      from: '"Echo & Insight" <echoinsightsupport@gmail.com>',
      to,
      subject,
      html,
    });

    console.log("Email sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
