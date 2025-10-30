import nodemailer from "nodemailer";

// Hämta inloggningsuppgifter från miljövariabler
const email = process.env.GMAIL_USER;
const appPassword = process.env.GMAIL_PASS;

export async function sendEmail({
  to,
  subject,
  text,
  html,
  attachments = [],
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: { filename: string; path: string }[];
}) {
  if (!email || !appPassword) {
    console.error("❌ Saknas miljövariabler för Gmail.");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: { user: email, pass: appPassword },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Neocinema AB" <${email}>`,
      to,
      subject,
      text,
      html,
      attachments,
    });
    console.log(`✅ Mejlet skickades till ${to}: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Fel vid mejlutskick:", error);
  }
}
