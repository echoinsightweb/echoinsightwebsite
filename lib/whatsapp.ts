import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";

let client: twilio.Twilio | null = null;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

export const sendWhatsAppMessage = async (to: string, message: string) => {
  if (!client) {
    console.warn("Twilio credentials missing. Skipping WhatsApp message to", to);
    return false;
  }

  // Format mobile number to E.164 if it's 10 digits
  let formattedTo = to.replace(/\D/g, "");
  if (formattedTo.length === 10) {
    formattedTo = "+91" + formattedTo;
  } else if (!formattedTo.startsWith("+")) {
    formattedTo = "+" + formattedTo;
  }

  try {
    const res = await client.messages.create({
      body: message,
      from: fromWhatsAppNumber,
      to: `whatsapp:${formattedTo}`,
    });
    console.log(`WhatsApp message sent to ${to}. SID: ${res.sid}`);
    return true;
  } catch (error) {
    console.error(`Failed to send WhatsApp message to ${to}:`, error);
    return false;
  }
};
