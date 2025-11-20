import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useFetch from "../hook/useFetch";
import TicketSelector from "../components/TicketSelector";
import "./PagesStyle/BookingPage.scss";
import { useAuth } from "../AuthContext";
import SeatSSE from "../components/SeatSSE";
import { Seat } from "../types/Booking";
import { formatScreeningTime } from "../utils/date";
import Spinner from "react-bootstrap/Spinner";
import PosterBox from "../components/PosterBox";
import TotalPrice from "../components/TotalPrice";
import SeatingMap from "../components/SeatingMap";
import NotificationToast from "../components/NotificationToast";
import BookingButton from "../components/BookingButton";
import GuestEmailInput from "../components/GuestEmailInput";
import { useSeatSelection, useGuestEmail } from "../hook/UseBookingLogic";

export default function BookingPage() {
  const { screeningId } = useParams<{ screeningId: string }>();
  const navigate = useNavigate();

  const [showDelay, setShowDelay] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowDelay(true), 4000);
    return () => clearTimeout(t);
  }, []);

  // State for SSE toast notifications
  const [show, setShow] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Tickets state
  const [tickets, setTickets] = useState<{ id: number; count: number; price?: number }[]>([]);

  const totalTickets = tickets.reduce((sum, t) => sum + t.count, 0);
  const totalPrice = tickets.reduce((sum, t) => sum + t.count * (t.price ?? 0), 0);

  const { user, isLoading: isAuthLoading } = useAuth();

  // Guest email hook
  const { guestEmail, handleEmailChange, isValidEmail } = useGuestEmail();

  // Fetch seats
  const {
    data: initialSeats,
    isLoading: isSeatsLoading,
    error,
  } = useFetch<Seat[]>(`/api/seatStatusView?screeningId=${screeningId}`);

  const [seats, setSeats] = useState<Seat[]>([]);
  useEffect(() => {
    if (initialSeats) setSeats(initialSeats);
  }, [initialSeats]);

  // Seat selection hook
  const {
    selectedSeats,
    setSelectedSeats,
    seatError,
    handleSeatClick,
  } = useSeatSelection(seats, totalTickets);

  // Booking API
  const { doFetch: postBooking } = useFetch<{
    message: string;
    bookingId: number;
    bookingNumber: string;
    seats: number[];
  }>("/api/booking/bookings");

  const { doFetch: getPriceBreakdown } = useFetch<
    {
      ticketType: string;
      quantity: number;
      subTotal: number;
      totalPrice: number;
    }[]
  >("/api/priceTotals", { skip: true });

  // Screening info
  const { data: screening } = useFetch<{
    title: string;
    info: { mobileImg: string };
    startTime: string;
    auditoriumName: string;
  }[]>(`/api/screeningsInfo?screeningId=${screeningId}`, { skip: !screeningId });

  // SSE seat updates
  const handleSeatUpdate = (seatIds: number[], status: "booked" | "available") => {
    setSeats((prev) =>
      prev.map((s) => (seatIds.includes(s.seatId) ? { ...s, seatStatus: status } : s))
    );

    setShow(true);

    if (status === "booked") {
      setSelectedSeats((prev) => prev.filter((s) => !seatIds.includes(s)));
      setToastMessage(`Plats${seatIds.length > 1 ? "er" : ""} ${seatIds.join(", ")} har precis blivit bokade!`);
    } else {
      setToastMessage(`Plats${seatIds.length > 1 ? "er" : ""} ${seatIds.join(", ")} har precis blivit avbokade!`);
    }
  };

  // Booking submission
  const handleBooking = async () => {
    // Validation Guards 
    if (!totalTickets) {
      setToastMessage("Välj minst en biljett!");
      setShow(true);
      return;
    }
    
    if (seatError) {
      setToastMessage(seatError);
      setShow(true);
      return;
    }
    
    if (selectedSeats.length < totalTickets) {
      setToastMessage("Du har valt färre stolar än antal biljetter!");
      setShow(true);
      return;
    }

    // Makes sure you have guestEmail if not logged in
    if (!user && !guestEmail) {
      setToastMessage("Ange din e-post för att boka som gäst.");
      setShow(true);
      return;
    }

    // Data Transformation 
    const uniqueTickets = tickets.reduce(
      (acc, cur) => {
        const found = acc.find((t) => t.id === cur.id);
        if (found) found.count += cur.count;
        else acc.push({ ...cur });
        return acc;
      },
      [] as { id: number; count: number }[]
    );

    const seatList: { seatId: number; ticketType: number }[] = [];
    const seatQueue = [...selectedSeats];

    for (const t of uniqueTickets) {
      for (let i = 0; i < t.count; i++) {
        const seatId = seatQueue.shift();
        if (seatId !== undefined) seatList.push({ seatId, ticketType: t.id });
      }
    }

    const bookingData = {
      screeningId: Number(screeningId),
      seats: seatList,
      guestEmail: user ? undefined : guestEmail,
    };

    try {
      const result = await postBooking(bookingData, "POST");
      const bookingNumber = result.bookingNumber;

      await getPriceBreakdown(
        `/api/priceTotals?bookingId=${result.bookingId}`,
        "GET"
      );

      navigate(`/Bekräftelse/${bookingNumber}`);
      
    } catch (err: any) {
      setToastMessage(`Kunde inte boka platser: ${err.message}`);
      setShow(true);
    }
  };

  // ---- Loading + error with spinner ----
  const LoadingUI = (
    <div className="d-flex flex-column align-items-center justify-content-center text-light" style={{ minHeight: "60vh" }}>
      <Spinner animation="border" role="status" />
      {showDelay && <p className="mt-3 neon-text">Laddar salong & platser...</p>}
    </div>
  );

  if (isSeatsLoading || isAuthLoading) return LoadingUI;
  if (error) return showDelay ? <div className="text-center text-danger mt-5">{String(error)}</div> : LoadingUI;

  const isGuestUser = !user;
  const isBookDisabled =
    (isGuestUser && !isValidEmail) || selectedSeats.length === 0;

  return (
    <main className="booking-page text-center xs-mb-5">
      <SeatSSE onSeatUpdate={handleSeatUpdate} screeningId={Number(screeningId)} />

      <div className="booking-layout">
        <aside className="booking-left">
          {screening?.[0] && (
            <PosterBox mobileImg={screening[0].info.mobileImg} title={screening[0].title} />
          )}

          <div className="ticket-section">
            <h5 className="neo-text">Välj biljetter</h5>
            <TicketSelector onTicketChange={setTickets} />
          </div>

          {totalTickets > 0 && <TotalPrice totalPrice={totalPrice} />}
        </aside>

        <section className="booking-right">
          {screening?.[0] && (
            <div className="heading-box">
              <h2 className="neo-text">
                {screening[0].auditoriumName} – {formatScreeningTime(screening[0].startTime)}
              </h2>
            </div>
          )}

          <div className="screen">DUKEN</div>

          
          {!user && totalTickets > 0 && (
            <GuestEmailInput guestEmail={guestEmail} handleEmailChange={handleEmailChange} />
          )}

          <SeatingMap seats={seats} selectedSeats={selectedSeats} handleSeatClick={handleSeatClick} />
          {seatError && <p style={{ color: "red", marginTop: "15px" }}>{seatError}</p>}

          {totalTickets > 0 && (
            <BookingButton
              isBookDisabled={isBookDisabled}
              handleBooking={handleBooking}
              isInvalidEmail={isBookDisabled}
              totalTickets={totalTickets}
            />
          )}
        </section>
      </div>

            {/* Toast Notification Container */}

      <NotificationToast setShow={setShow} show={show} toastMessage={toastMessage} />
    </main>
  );
}