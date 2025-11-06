import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { getMovieImage } from "../utils/getMovieImage";
import { Booking } from "../types/Booking";
import "../styles/BookingConfirmation.scss"; 

export default function BookingConfirmation() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);

  console.log(booking)
  

   useEffect(() => {
    if (!bookingId) return; 

    fetch(`/api/booking/${bookingId}`, {
      credentials: "include"
    })
      .then(async res => {
        if (!res.ok) {
          // Försök läsa backendens JSON-fel
          let errorMsg = `Något gick fel (${res.status})`;
          try {
            const data = await res.json();
            errorMsg = data.error || errorMsg;
          } catch {
            // Om JSON inte finns
            errorMsg = res.statusText || errorMsg;
          }
          throw new Error(errorMsg);
        }

        const data: Booking = await res.json();
        console.log("✅ Hämtad booking:", data);
        setBooking(data);
      })
      .catch(err => {
        console.error("Kunde inte hämta bokningsbekräftelse:", err);
        setError(err.message);
      });

  }, [bookingId, navigate]); 

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!booking) return <p>Laddar bekräftelse...</p>;

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("NeoCinema - Biobiljett", 20, 20);

    doc.setFontSize(12);
    doc.text(`Bokningsnummer: ${booking.bookingNumber}`, 20, 40);
    doc.text(`Film: ${booking.movieTitle}`, 20, 50);
    doc.text(
      `Tid: ${new Date(booking.screeningTime).toLocaleString("sv-SE")}`,
      20,
      60
    );
    doc.text(`Salong: ${booking.auditoriumName}`, 20, 70);
    doc.text(`Totalt pris: ${booking.totalPrice} kr`, 20, 80);
    doc.text(`E-post: ${booking.email}`, 20, 90);
    doc.save(`biljett_${booking.bookingNumber}.pdf`);
  };

  return (
 <section className="booking-confirmation"> 
  <div className="confirmation-title"> <h2 >Dina platser är bokade!</h2></div>

  <div className="neon-border">

  <div className="confirmation-info">
  <div className="booking-text">
    <p>
      Bookingnumber: <strong>{booking.bookingNumber}</strong>
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
              {t.quantity} × {t.ticketType} ({t.price} kr)
            </li>
          ))}
        </ul>
        <p><b>Totalt:</b> {booking.totalPrice} kr</p>
      </div>
    )}
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