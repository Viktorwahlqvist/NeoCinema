import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useFetch from "../hook/useFetch";
import TicketSelector from "../components/TicketSelector";
import "./PagesStyle/BookingPage.scss";
import { useAuth } from "../AuthContext";
import SeatSSE from "../components/SeatSSE";
import { Seat, User } from "../types/Booking";
import { formatScreeningTime } from "../utils/date";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import Spinner from "react-bootstrap/Spinner";

const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Finds a contiguous block of 'n' available seats.
 * If 'startSeatId' is provided, it tries to find a block adjacent to that seat.
 */
function findAdjacentSeats(
  seats: Seat[],
  n: number,
  startSeatId?: number
): number[] {
  // Group seats by row
  const rows = seats.reduce((acc: Record<number, Seat[]>, seat) => {
    if (!acc[seat.row_num]) acc[seat.row_num] = [];
    acc[seat.row_num].push(seat);
    return acc;
  }, {});

  // Logic for when a user clicks a specific seat
  if (startSeatId) {
    const clickedSeat = seats.find((s) => s.seatId === startSeatId);
    if (!clickedSeat) return [];

    // Filter for available seats on the *same row* as the clicked seat
    const rowSeats = rows[clickedSeat.row_num]
      .filter((s) => s.seatStatus === "available")
      .sort((a, b) => a.seat_num - b.seat_num);

    const index = rowSeats.findIndex((s) => s.seatId === clickedSeat.seatId);

    // If the clicked seat is not available (index = -1), stop
    if (index === -1) return [];

    // Try to find 'n' seats to the right (including the clicked one)
    const right = rowSeats.slice(index, index + n);
    const isContiguousRight = right.every(
      (s, j, arr) => j === 0 || s.seat_num === arr[j - 1].seat_num + 1
    );
    if (right.length === n && isContiguousRight) {
      return right.map((s) => s.seatId);
    }

    // Try to find 'n' seats to the left (including the clicked one)
    const leftStart = Math.max(0, index - n + 1);
    const left = rowSeats.slice(leftStart, index + 1);
    const isContiguousLeft = left.every(
      (s, j, arr) => j === 0 || s.seat_num === arr[j - 1].seat_num + 1
    );
    if (left.length === n && isContiguousLeft) {
      return left.map((s) => s.seatId);
    }
  }

  // Logic for automatic selection (find the best available block)
  for (const row of Object.values(rows)) {
    const available = row
      .filter((s) => s.seatStatus === "available")
      .sort((a, b) => a.seat_num - b.seat_num);

    for (let i = 0; i <= available.length - n; i++) {
      const segment = available.slice(i, i + n);
      const contiguous = segment.every(
        (s, j, arr) => j === 0 || s.seat_num === arr[j - 1].seat_num + 1
      );
      if (contiguous) return segment.map((s) => s.seatId);
    }
  }

  return [];
}

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

  // Core booking state
  const [tickets, setTickets] = useState<
    { id: number; count: number; price?: number }[]
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
      info: { mobileImg: string };
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
            <div className="movie-poster-box">
              <img
                src={screening[0].info?.mobileImg || "/placeholder.jpg"}
                alt={screening[0].title}
                className="movie-poster"
              />
            </div>
          )}

          <div className="ticket-section">
            <h5 className="neon-text">Välj biljetter</h5>
            <TicketSelector onTicketChange={setTickets} />
          </div>

          {totalTickets > 0 && (
            <div className="ticket-total-box mt-3">
              <p className="text-light">Totalt pris</p>
              <h4 className="neon-text">{totalPrice} kr</h4>
            </div>
          )}
        </aside>

        <section className="booking-right">
          {screening?.[0] && (
            <div className="heading-box">
              <h2 className="neon-text">
                {screening[0].auditoriumName} –{" "}
                {formatScreeningTime(screening[0].startTime)}
              </h2>
            </div>
          )}
          <div className="screen">DUKEN</div>

          {/* Gäst-email (bara om utloggad och har valt biljetter) */}
          {!user && totalTickets > 0 && (
            <div className="guest-email mb-3">
              <label className="form-label text-light">E-post</label>
              <input
                type="email"
                className="form-control"
                placeholder="namn@exempel.se"
                value={guestEmail}
                onChange={handleEmailChange}
              />
            </div>
          )}

          {/* Seating Map */}
          <div className="seating-area">
            {Object.entries(
              seats.reduce((acc: Record<number, Seat[]>, seat) => {
                if (!acc[seat.row_num]) acc[seat.row_num] = [];
                acc[seat.row_num].push(seat);
                return acc;
              }, {})
            )
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([row, rowSeats]) => (
                <div key={row} className="seat-row">
                  {rowSeats
                    .sort((a, b) => a.seat_num - b.seat_num)
                    .map((seat) => (
                      <button
                        key={seat.seatId}
                        className={`seat ${
                          seat.seatStatus === "booked" ? "booked" : ""
                        } ${
                          selectedSeats.includes(seat.seatId) ? "selected" : ""
                        }`}
                        onClick={() =>
                          handleSeatClick(seat.seatId, seat.seatStatus)
                        }
                      >
                        {seat.seatId}
                      </button>
                    ))}
                </div>
              ))}
          </div>

          {seatError && (
            <p style={{ color: "red", marginTop: "15px" }}>{seatError}</p>
          )}

          {totalTickets > 0 && (
            <button
              className={`btn neo-btn mt-4 ${
                isBookDisabled || isInvalidEmail ? "neo-btn--disabledEmail" : ""
              }`}
              onClick={handleBooking}
              disabled={isBookDisabled || isInvalidEmail}
            >
              Boka {totalTickets} biljett(er)
            </button>
          )}
        </section>
      </div>

      {/* Toast Notification Container */}
      <ToastContainer position="top-end" className="p-3 toast-under-navbar">
        <Toast
          onClose={() => setShow(false)}
          show={show}
          delay={5000}
          animation={true}
          autohide
          className="toast-styling w-auto"
        >
          <Toast.Header className="toast-header-styling">
            <img
              src="holder.js/20x20?text=%20"
              className="rounded me-2"
              alt=""
            />
            <strong className="me-auto">Notifikation</strong>
            <small>Just nu</small>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </main>
  );
}