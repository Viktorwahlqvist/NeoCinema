import nodemailer from "nodemailer";

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
  attachments?: any[]; 
}) {
 // Check if required environment variables exist
  if (!email || !appPassword) {
    console.error("Saknas miljövariabler för Gmail.");
    return;
  }

  // Create a transporter using Gmail service and app password
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: { user: email, pass: appPassword },
  });

  // Send the actual email with the provided data
  const info = await transporter.sendMail({
    from: `"Neocinema AB" <${email}>`,
    to,
    subject,
    text,
    html,
    attachments,
  });
}

