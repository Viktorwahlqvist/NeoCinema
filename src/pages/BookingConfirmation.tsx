import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { getMovieImage } from "../utils/getMovieImage";
import "../styles/BookingConfirmation.scss";
import { Booking } from "../types/Booking";
import { formatScreeningTime } from "../utils/date";

export default function BookingConfirmation() {
  
  const { bookingNumber } = useParams<{ bookingNumber: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);

  console.log(booking);


  useEffect(() => {
    if (!bookingNumber) return;

   
    fetch(`/api/booking/confirmation/${bookingNumber}`)
      .then(async (res) => {
        if (!res.ok) {
          let errorMsg = `Något gick fel (${res.status})`;
          try {
            const data = await res.json();
            errorMsg = data.error || errorMsg;
          } catch {
            errorMsg = res.statusText || errorMsg;
          }
          throw new Error(errorMsg);
        }
        const data: Booking = await res.json();
        console.log("✅ Hämtad booking:", data);
        setBooking(data);
      })
      .catch((err) => {
        console.error("Kunde inte hämta bokningsbekräftelse:", err);
        setError(err.message);
      });
  }, [bookingNumber, navigate]); 

  
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!booking) return <p>Laddar bekräftelse...</p>;

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const x_position = 20;
    const line_height = 9;
    let y_position = 40;

    doc.setFontSize(20);
    doc.text("NeoCinema - Biobiljett", x_position, 20);

    doc.setFontSize(12);
    doc.text(`Bokningsnummer: ${booking.bookingNumber}`, x_position, y_position);
    y_position += line_height;

    doc.text(`Film: ${booking.movieTitle}`, x_position, y_position);
    y_position += line_height;

    const formattedScreeningTime = formatScreeningTime(booking.screeningTime);
    doc.text(`Tid: ${formattedScreeningTime}`, x_position, y_position);
    y_position += line_height;

    doc.text(`Salong: ${booking.auditoriumName}`, x_position, y_position);
    y_position += line_height * 1.5;

    doc.setFontSize(12);
    doc.text("Biljetter:", x_position, y_position);
    y_position += line_height;

    if (booking.tickets && booking.tickets.length > 0) {
      doc.setFontSize(10);
      booking.tickets.forEach((t) => {
        const ticketLine = `${t.qty} × ${t.ticketType} (Totalt: ${
          t.qty * t.price
        } kr)`;
        doc.text(ticketLine, x_position + 5, y_position);
        y_position += line_height - 2;
      });
    }

    y_position += 4;
    doc.setFontSize(12);
    doc.text("Platser:", x_position, y_position);
    y_position += line_height;

    if (booking.seatNumbers && booking.seatNumbers.length > 0) {
      doc.setFontSize(10);
      booking.seatNumbers.forEach((seat) => {
        doc.text(seat, x_position + 5, y_position);
        y_position += line_height - 2;
      });
    }

    y_position += 4;
    doc.setFontSize(12);
    doc.text(`Totalt pris: ${booking.totalPrice} kr`, x_position, y_position);
    y_position += line_height;

    doc.text(`E-post: ${booking.email}`, x_position, y_position);
    y_position += line_height;

    doc.save(`biljett_${booking.bookingNumber}.pdf`);
  };

  return (
    <section className="booking-confirmation">
      <div className="confirmation-title">
        <h2>Dina platser är bokade!</h2>
      </div>

      <div className="neon-border">
        <div className="confirmation-info">
          <div className="booking-text">
            <p>
              Bokningsid:{" "}
              <strong className="bookingNr">{booking.bookingNumber}</strong>
            </p>
            <p>
              Bekräftelse har skickats till:
              <br />
              <strong>{booking.email}</strong>
            </p>

            {booking.tickets && booking.tickets.length > 0 && (
              <div className="ticket-summary">
                <h4>Biljetter</h4>
                <ul>
                  {booking.tickets.map((t, index) => (
                    <li key={index}>
                      {t.qty} × {t.ticketType} ({t.qty * t.price} kr)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {booking.seatNumbers && booking.seatNumbers.length > 0 && (
              <div className="ticket-summary">
                <h4>Platser</h4>
                {booking.seatNumbers.map((seat, index) => (
                  <p key={index} style={{ margin: 0 }}>
                    {seat}
                  </p>
                ))}
              </div>
            )}

            <p style={{ marginTop: "16px" }}>
              <b>Totalt:</b> {booking.totalPrice} kr
            </p>
          </div>
        </div>

        <div className="movie-image">
          <img
            src={getMovieImage(booking.movieTitle)}
            alt={booking.movieTitle}
          />
        </div>
      </div>

      <div className="btn-group">
        <button className="btn-glow" onClick={handleDownloadPDF}>
          Ladda ned biljett <i className="bi bi-download"></i>
        </button>
        <button className="btn-glow" onClick={() => navigate("/")}>
          Tillbaka
        </button>
      </div>
    </section>
  );
}
