import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { formatScreeningTime } from "../utils/date";
import priceFormat from "../utils/priceFormat";
import { Booking } from "../types/Booking";
import fetchImageAsDataUrl from "../utils/fetchImageAsDataUrl";

export default async function buildPdf(
  booking: Booking,
  qrDataUrl: string | null
) {

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();

  const colors = {
    bgDark: "#101424",
    accent: "#2F57FF",
    accentEnd: "#9B00D8",
    text: "#111",
    gray: "#555",
  };

  // Header
  const headerH = 80;
  doc.setFillColor(colors.bgDark);
  doc.rect(0, 0, pageW, headerH, "F");
  doc.setFillColor(colors.accent);
  doc.rect(0, headerH - 5, pageW * 0.65, 3, "F");
  doc.setFillColor(colors.accentEnd);
  doc.rect(pageW * 0.65, headerH - 5, pageW * 0.35, 3, "F");

  // Logo
  const logo = await fetchImageAsDataUrl("/NeoCinema.png");
  if (logo) {
    const h = 52;
    const w = 150;
    const y = (headerH - h) / 2 - 4;
    doc.addImage(logo, "PNG", 32, y, w, h);
  }

  const marginX = 40;
  let y = headerH + 34;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setTextColor(colors.text);
  doc.setFontSize(20);
  doc.text("Biobiljett", marginX, y);
  y += 10;
  doc.setDrawColor(225);
  doc.setLineWidth(1);
  doc.line(marginX, y, pageW - marginX, y);
  y += 26;

  const dividerX = pageW * 0.5;
  const leftWidth = dividerX - marginX - 12;
  const blockGap = 24;
  const valueOffset = 16;

  function block(label: string, value: string) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(colors.gray);
    doc.text(label, marginX, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(colors.text);
    const lines = doc.splitTextToSize(value.replace(/\u00A0/g, " "), leftWidth);
    doc.text(lines, marginX, y + valueOffset);
    const extra = (Array.isArray(lines) ? lines.length - 1 : 0) * 14;
    y += valueOffset + blockGap + extra;
  }

  // Details
  block("FILM", booking.movieTitle);
  block("SALONG", booking.auditoriumName);
  block("DATUM & TID", formatScreeningTime(booking.screeningTime));

  if (booking.tickets?.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(colors.gray);
    doc.text("BILJETTER", marginX, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(colors.text);

    let curY = y + valueOffset;
    booking.tickets.forEach((t) => {
      const line = `${t.qty} × ${t.ticketType} (${priceFormat(t.qty * t.price)})`;
      const wrapped = doc.splitTextToSize(line, leftWidth);
      doc.text(wrapped, marginX, curY);
      const extra = (Array.isArray(wrapped) ? wrapped.length - 1 : 0) * 14;
      curY += 14 + extra;
    });

    // Total
    const indent = 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(colors.gray);
    const label = "Totalt:";
    const labelX = marginX + indent;
    doc.text(label, labelX, curY + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    doc.setTextColor(colors.text);
    const valX = labelX + doc.getTextWidth(label) + 6;
    doc.text(priceFormat(booking.totalPrice as number), valX, curY + 6);

    y = curY + blockGap + 6;
  }

  if (booking.seatNumbers?.length) {
    block("PLATSER", booking.seatNumbers.join(", "));
  }
  block("E-POST", booking.email);

  // Divider
  doc.setDrawColor(210);
  if ((doc as any).setLineDash) {
    (doc as any).setLineDash([3, 3], 0);
    doc.line(dividerX, headerH + 34, dividerX, y + 30);
    (doc as any).setLineDash([]);
  } else {
    for (let dashY = headerH + 34; dashY < y + 30; dashY += 6) {
      doc.line(dividerX, dashY, dividerX, dashY + 3);
    }
  }

  // QR-Card
  const cardW = 220;
  const cardH = 240;
  const cardX = pageW * 0.54;
  const cardY = headerH + 54;
  doc.setFillColor("#FFFFFF");
  doc.setDrawColor(235);
  doc.roundedRect(cardX, cardY, cardW, cardH, 12, 12, "FD");

  const qrImage =
    qrDataUrl ||
    (await QRCode.toDataURL(booking.bookingNumber, {
      errorCorrectionLevel: "L",
      margin: 2,
      scale: 6,
    }));

  const qrSize = 150;
  const qrX = cardX + (cardW - qrSize) / 2;
  const qrY = cardY + 28;
  doc.addImage(qrImage, "PNG", qrX, qrY, qrSize, qrSize);

  // bookingsnumber text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(colors.gray);
  doc.text("Bokningsnummer", cardX + cardW / 2, cardY + 210, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(colors.text);
  doc.text(booking.bookingNumber, cardX + cardW / 2, cardY + 228, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(colors.gray);
  doc.text(
    "Visa denna QR-kod vid entrén • Välkommen!",
    cardX + cardW / 2,
    cardY + cardH + 18,
    { align: "center" }
  );

  // Save PDF
  doc.save(`NeoCinema_${booking.bookingNumber}.pdf`);
}
