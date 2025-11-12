import { useParams, useNavigate } from "react-router-dom";
import { Booking } from "../types/Booking";
import { useQRCode } from "../hook/useQRCode";
import "./PagesStyle/BookingConfirmation.scss"
import useFetch from "../hook/useFetch";
import buildPdf from "../pdf/buildPdf";
import QrCodeCard from "../components/QrCodeCard";
import TicketList from "../components/TicketList";
import SeatList from "../components/SeatList";
import MetaInfo from "../components/MetaInfo";

export default function BookingConfirmation() {
  const { bookingNumber } = useParams<{ bookingNumber: string }>();
  const navigate = useNavigate();
  const {data, isLoading, error} = useFetch<Booking>(`/api/booking/confirmation/${bookingNumber}`)
   const {qrDataUrl, isLoading : qrIsLoading, error: qrError} = useQRCode(data?.bookingNumber as string)


  if (qrError) return <p style={{ color: "red" }}>{qrError}</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!data) return <p>Laddar bekräftelse...</p>;



  return (
    <section className="booking-confirmation">
      <div className="confirmation-title">
        <h2>Dina platser är bokade!</h2>
      </div>

      <div className="confirmation-grid">
        <h3 className="movie-title">{data.movieTitle}</h3>

        <div className="confirmation-inner">
          {/* RIGHT (desktop): QR — placed second so it sits in the right column */}
          {/* LEFT: Details */}
          <div className="details-column">
            <TicketList totalPrice={data.totalPrice as number} tickets={data.tickets}/>
            <SeatList seatNumbers={data.seatNumbers}/>
            <MetaInfo email={data.email} bookingNumber={data.bookingNumber}/>
          </div>
          {qrDataUrl && 
            <QrCodeCard qrDataUrl={qrDataUrl}/>
          }
          </div>
        </div>

      <div className="btn-group">
        <button className="btn-glow" disabled={qrIsLoading} onClick={() => buildPdf(data, qrDataUrl)}>
          Ladda ned biljett <i className="bi bi-download" />
        </button>
        <button className="btn-glow" onClick={() => navigate("/")}>
          Tillbaka
        </button>
      </div>
    </section>
  );
}