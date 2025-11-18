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
import findAdjacentSeats from "../utils/findAdjacentSeats";
import PosterBox from "../components/PosterBox";
import TotalPrice from "../components/TotalPrice";
import SeatingMap from "../components/SeatingMap";
import NotificationToast from "../components/NotificationToast";
import BookingButton from "../components/BookingButton";
import GuestEmailInput from "../components/GuestEmailInput";
import emailRegex from "../utils/emailValidate";


export default function BookingPage() {
  const { screeningId } = useParams<{ screeningId: string; }>();
  const navigate = useNavigate();

  const [showDelay, setShowDelay] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowDelay(true), 4000);
    return () => clearTimeout(t);
  }, []);

  // State for SSE toast notifications
  const [show, setShow] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Core booking state
  const [tickets, setTickets] = useState<
    { id: number; count: number; price?: number; }[]
  >([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [seatError, setSeatError] = useState<string | null>(null);

  // Auth & Guest state
  const { user, isLoading: isAuthLoading } = useAuth();
  const [guestEmail, setGuestEmail] = useState("");

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGuestEmail(value);
  };

  // Derived state
  const totalTickets = tickets.reduce((sum, t) => sum + t.count, 0);
  const totalPrice = tickets.reduce(
    (sum, t) => sum + t.count * (t.price ?? 0),
    0
  );

  // Fetch seats for this screening
  const {
    data: initialSeats,
    isLoading: isSeatsLoading,
    error,
  } = useFetch<Seat[]>(`/api/seatStatusView?screeningId=${screeningId}`);

  const [seats, setSeats] = useState<Seat[]>([]);

  useEffect(() => {
    if (initialSeats) setSeats(initialSeats);
  }, [initialSeats]);

  // Booking API hooks
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

  // Screening info for poster, name, etc.
  const { data: screening } = useFetch<
    {
      title: string;
      info: { mobileImg: string; };
      startTime: string;
      auditoriumName: string;
    }[]
  >(`/api/screeningsInfo?screeningId=${screeningId}`, { skip: !screeningId });

  // Auto-seat-selection
  useEffect(() => {
    setSeatError(null);

    if (totalTickets === 0) {
      setSelectedSeats([]);
      return;
    }

    if (selectedSeats.length !== totalTickets) {
      const best = findAdjacentSeats(seats, totalTickets);
      setSelectedSeats(best);

      if (best.length === 0 && seats.length > 0) {
        setSeatError(
          `Kunde tyvärr inte hitta ${totalTickets} sammanhängande platser. Prova ett färre antal eller dela upp din bokning.`
        );
      }
    }
  }, [seats, totalTickets]);

  // SSE seat updates
  const handleSeatUpdate = (
    seatIds: number[],
    status: "booked" | "available"
  ) => {
    setSeats((prev) =>
      prev.map((s) =>
        seatIds.includes(s.seatId) ? { ...s, seatStatus: status } : s
      )
    );

    setShow(true);

    if (status === "booked") {
      setSelectedSeats((prev) => prev.filter((s) => !seatIds.includes(s)));
      setToastMessage(
        `Plats${seatIds.length > 1 ? "er" : ""} ${seatIds.join(
          ", "
        )} har precis blivit bokade!`
      );
    } else {
      setToastMessage(
        `Plats${seatIds.length > 1 ? "er" : ""} ${seatIds.join(
          ", "
        )} har precis blivit avbokade!`
      );
    }
  };

  // Manual seat click
  const handleSeatClick = (seatId: number, status: string) => {
    if (status === "booked" || !seats) return;

    setSeatError(null);

    const best = findAdjacentSeats(seats, totalTickets, seatId);
    if (best.length === totalTickets) {
      setSelectedSeats(best);
    } else {
      setSeatError(
        `Kunde inte hitta ${totalTickets} platser i rad från den valda platsen.`
      );
      setSelectedSeats([]);
    }
  };

  // Booking submission
  const handleBooking = async () => {
    if (!totalTickets) return alert("Välj minst en biljett!");
    if (seatError) return alert(seatError);
    if (selectedSeats.length < totalTickets)
      return alert("Du har valt färre stolar än antal biljetter!");

    const uniqueTickets = tickets.reduce(
      (acc, cur) => {
        const found = acc.find((t) => t.id === cur.id);
        if (found) found.count += cur.count;
        else acc.push({ ...cur });
        return acc;
      },
      [] as { id: number; count: number; }[]
    );

    const seatList: { seatId: number; ticketType: number; }[] = [];
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
      alert(`Kunde inte boka platser: ${err.message}`);
    }
  };

  // ---- Loading + error with spinner ----
  const LoadingUI = (
    <div
      className="d-flex flex-column align-items-center justify-content-center text-light"
      style={{ minHeight: "60vh" }}
    >
      <Spinner animation="border" role="status" />
      {showDelay && (
        <p className="mt-3 neon-text">Laddar salong & platser...</p>
      )}
    </div>
  );

  if (isSeatsLoading || isAuthLoading) return LoadingUI;

  if (error)
    return showDelay ? (
      <div className="text-center text-danger mt-5">{String(error)}</div>
    ) : (
      LoadingUI
    );

  // ---- Button disable / färg beroende på e-post ----
  const isGuestUser = !user;
  const isBookDisabled = isGuestUser && guestEmail.trim() === "";
  const isInvalidEmail = isGuestUser && guestEmail.trim() !== "" && !emailRegex.test(guestEmail);

  return (
    <main className="booking-page text-center xs-mb-5">
      <SeatSSE
        onSeatUpdate={handleSeatUpdate}
        screeningId={Number(screeningId)}
      />

      <div className="booking-layout">
        <aside className="booking-left">
          {screening?.[0] && (
            <PosterBox mobileImg={screening?.[0].info.mobileImg} title={screening?.[0].title} />
          )}

          <div className="ticket-section">
            <h5 className="neo-text">Välj biljetter</h5>
            <TicketSelector onTicketChange={setTickets} />
          </div>

          {totalTickets > 0 && (
            <TotalPrice totalPrice={totalPrice} />
          )}
        </aside>

        <section className="booking-right">
          {screening?.[0] && (
            <div className="heading-box">
              <h2 className="neo-text">
                {screening[0].auditoriumName} –
                {formatScreeningTime(screening[0].startTime)}
              </h2>
            </div>
          )}
          <div className="screen">DUKEN</div>

          {/* Gäst-email (bara om utloggad och har valt biljetter) */}
          {!user && totalTickets > 0 && (
            <GuestEmailInput guestEmail={guestEmail} handleEmailChange={handleEmailChange} />
          )}

          {/* Seating Map */}
          <SeatingMap seats={seats} selectedSeats={selectedSeats} handleSeatClick={handleSeatClick} />
          {seatError && (
            <p style={{ color: "red", marginTop: "15px" }}>{seatError}</p>
          )}

          {totalTickets > 0 && (
            <BookingButton isBookDisabled={isBookDisabled} handleBooking={handleBooking} isInvalidEmail={isInvalidEmail} totalTickets={totalTickets} />
          )}
        </section>
      </div>

      {/* Toast Notification Container */}
      <NotificationToast setShow={setShow} show={show} toastMessage={toastMessage} />

    </main>
  );
}