import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { getMovieImage } from "../utils/getMovieImage";
import { Booking } from "../types/Booking";
import "./BookingConfirmation.scss"; // 

export default function BookingConfirmation() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetch(`/api/bookings/${bookingId}`)
      .then(res => res.json())
      .then((data: Booking) => setBooking(data))
      .catch(err => console.error(err));
  }, [bookingId]);

  if (!booking) return <p>Laddar bekräftelse...</p>;

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("NeoCinema - Biobiljett", 20, 20);

    doc.setFontSize(12);
    doc.text(`Bokningsnummer: ${booking.rNumber}`, 20, 40);
    doc.text(`Film: ${booking.movieTitle}`, 20, 50);
    doc.text(
      `Tid: ${new Date(booking.screeningTime).toLocaleString("sv-SE")}`,
      20,
      60
    );
    doc.text(`Salong: ${booking.auditoriumName}`, 20, 70);
    doc.text(`Totalt pris: ${booking.totalPrice} kr`, 20, 80);
    doc.text(`E-post: ${booking.email}`, 20, 90);
    doc.save(`biljett_${booking.rNumber}.pdf`);
  };

  return (
 <section className="booking-confirmation"> 
  <div className="confirmation-title"> <h2 >Dina platser är bokade!</h2></div>

  <div className="neon-border">

    <div className="confirmation-info">
  
  <div className="booking-text">
    <p>
      Bokningsid: <strong>{booking.rNumber}</strong>
    </p>
    <p>
      Bekräftelse har skickats till:
      <br />
      <strong>{booking.email}</strong>
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
