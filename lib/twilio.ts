import twilio from "twilio";

// Server-only Twilio wrapper. Never import this from client components.
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

export async function sendSms(to: string, body: string) {
  if (!accountSid || !authToken || !messagingServiceSid) {
    console.warn("Twilio not configured — skipping SMS");
    return null;
  }

  const client = twilio(accountSid, authToken);
  const message = await client.messages.create({
    messagingServiceSid,
    to,
    body,
  });

  return message.sid;
}
