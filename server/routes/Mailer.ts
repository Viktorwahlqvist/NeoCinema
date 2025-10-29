import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const secretPath = path.join(__dirname, "gmail-secret.json");

// Läs in e-post och app-lösenord från gmail-secret.json
let emailInfo: { email: string; appPassword: string };

try {
  const fileData = fs.readFileSync(secretPath, "utf-8");
  emailInfo = JSON.parse(fileData);
} catch (error) {
  console.error("\n❌ Kunde inte läsa gmail-secret.json!");
  console.error("Se till att filen finns i backend-mappen och innehåller e-post & appPassword.");
  emailInfo = { email: "", appPassword: "" };
}

// Typ för mejlets innehåll
interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: { filename: string; path: string }[];
}

// Funktion som skickar mejl
export async function sendEmail({ to, subject, text, html, attachments = [] }: EmailOptions) {
  if (!emailInfo.email || !emailInfo.appPassword) {
    console.error("❌ Saknas inloggningsuppgifter för Gmail. Mejlet skickas inte.");
    return;
  }

  // Skapa en transporter (Gmail-klient)
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: emailInfo.email,
      pass: emailInfo.appPassword,
    },
  });

  try {
    // Skicka mejlet
    const info = await transporter.sendMail({
      from: `"Neocinema AB" <${emailInfo.email}>`,
      to,
      subject,
      text,
      html,
      attachments,
    });

    console.log(`Mejlet skickades till ${to}: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Fel vid mejlutskick:", error);
  }
}