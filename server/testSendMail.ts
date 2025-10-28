// OBS: justera importvägen så den pekar på din Mailer.ts
import { sendEmail } from "./routes/Mailer.ts";

await sendEmail({
  to: "din-mottagare@example.com",
  subject: "Test från NEOCINEMA",
  html: "<p>Detta är ett testmejl via NodeMailer.</p>",
});
console.log("yes!!! Klar – kolla inkorgen!");
