import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { getMovieImage } from "../utils/getMovieImage";
import { formatScreeningTime } from "../utils/date";
import { Booking } from "../types/Booking";
import "../styles/BookingConfirmation.scss";

async function toDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const ct = res.headers.get("Content-Type") || "";
    if (!ct.startsWith("image/")) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function priceFormat(value: number) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace(/\u00A0/g, " ");
}

async function buildPdf(booking: Booking, qrDataUrl: string | null) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();

  const colors = {
    bgDark: "#101424",
    accent: "#2F57FF",
    accentEnd: "#9B00D8",
    text: "#111",
    gray: "#555",
  };

  // Header (logo only)
  const headerH = 80;
  doc.setFillColor(colors.bgDark);
  doc.rect(0, 0, pageW, headerH, "F");
  doc.setFillColor(colors.accent);
  doc.rect(0, headerH - 5, pageW * 0.65, 3, "F");
  doc.setFillColor(colors.accentEnd);
  doc.rect(pageW * 0.65, headerH - 5, pageW * 0.35, 3, "F");

  const logo = await toDataUrl("/logo.png");
  if (logo) {
    const h = 52;
    const w = 150;
    const y = (headerH - h) / 2 - 4;
    doc.addImage(logo, "PNG", 32, y, w, h);
  }

  const marginX = 40;
  let y = headerH + 34;

  // Title and rule
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

  // Order: Biljetter (with Totalt), Platser, then meta (id/email) is visual-only on web; PDF keeps key info
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

    // Totalt
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
    doc.text(priceFormat(booking.totalPrice), valX, curY + 6);

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

  // QR card
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
  doc.text("Visa denna QR-kod vid entrén • Välkommen!", cardX + cardW / 2, cardY + cardH + 18, {
    align: "center",
  });

  doc.save(`NeoCinema_${booking.bookingNumber}.pdf`);
}

export default function BookingConfirmation() {
  const { bookingNumber } = useParams<{ bookingNumber: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingNumber) return;
    fetch(`/api/booking/confirmation/${bookingNumber}`)
      .then(async (res) => {
        if (!res.ok) {
          let msg = `Fel (${res.status})`;
          try { const d = await res.json(); msg = d.error || msg; } catch {}
          throw new Error(msg);
        }
        return res.json() as Promise<Booking>;
      })
      .then(setBooking)
      .catch((e) => setError(e.message));
  }, [bookingNumber]);

  useEffect(() => {
    if (!booking) return;
    QRCode.toDataURL(booking.bookingNumber, { errorCorrectionLevel: "L", margin: 2, scale: 6 })
      .then(setQrDataUrl)
      .catch(() => {});
  }, [booking]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!booking) return <p>Laddar bekräftelse...</p>;

  return (
    <section className="booking-confirmation">
      <div className="confirmation-title">
        <h2>Dina platser är bokade!</h2>
      </div>

      <div className="confirmation-grid">
        <h3 className="movie-title">{booking.movieTitle}</h3>

        <div className="confirmation-inner">
          {/* RIGHT (desktop): QR — placed second so it sits in the right column */}
          {/* LEFT: Details */}
          <div className="details-column">
            {booking.tickets?.length > 0 && (
              <div className="block">
                <h4 className="block-title">Biljetter</h4>
                <ul className="ticket-list">
                  {booking.tickets.map((t, i) => (
                    <li key={i}>
                      {t.qty} × {t.ticketType} ({t.qty * t.price} kr)
                    </li>
                  ))}
                  <li className="total-row">
                    Totalt: <span>{booking.totalPrice} kr</span>
                  </li>
                </ul>
              </div>
            )}

            {booking.seatNumbers?.length > 0 && (
              <div className="block">
                <h4 className="block-title">Platser</h4>
                <ul className="seat-list">
                  {booking.seatNumbers.map((seat, i) => (
                    <li key={i}>{seat}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="block meta-block">
              <p className="meta-line">
                Bokningsid: <strong>{booking.bookingNumber}</strong>
              </p>
              <p className="meta-line">
                Bekräftelse skickad till:
                <br />
                <strong>{booking.email}</strong>
              </p>
            </div>
          </div>

          {qrDataUrl && (
            <div className="qr-column">
              <h4 className="block-title">QR-kod</h4>
              <div className="qr-frame">
                <img src={qrDataUrl} alt="Biljett QR" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="btn-group">
        <button className="btn-glow" onClick={() => buildPdf(booking, qrDataUrl)}>
          Ladda ned biljett <i className="bi bi-download" />
        </button>
        <button className="btn-glow" onClick={() => navigate("/")}>
          Tillbaka
        </button>
      </div>
    </section>
  );
}