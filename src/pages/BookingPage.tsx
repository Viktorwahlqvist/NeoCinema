import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useFetch from "../hook/useFetch";
import TicketSelector from "../components/TicketSelector";
import "./PagesStyle/BookingPage.scss";
import { useAuth } from "../AuthContext";
import SeatSSE from "../components/SeatSSE";
import { Seat, User } from "../types/Booking"; // Assumes types are from central file
import { formatScreeningTime } from "../utils/date";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";

/**
 * Finds a contiguous block of 'n' available seats.
 * If 'startSeatId' is provided, it tries to find a block adjacent to that seat.
 */
function findAdjacentSeats(
  seats: Seat[],
  n: number,
  startSeatId?: number
): number[] {
  // 1. Group seats by row
  const rows = seats.reduce((acc: Record<number, Seat[]>, seat) => {
    if (!acc[seat.row_num]) acc[seat.row_num] = [];
    acc[seat.row_num].push(seat);
    return acc;
  }, {});

  // 2. Logic for when a user clicks a specific seat
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
    const left = rowSeats.slice(leftStart, index + 1); // Select 'n' seats ending at 'index'
    const isContiguousLeft = left.every(
      (s, j, arr) => j === 0 || s.seat_num === arr[j - 1].seat_num + 1
    );
    if (left.length === n && isContiguousLeft) {
      return left.map((s) => s.seatId);
    }
  }

  // 3. Logic for automatic selection (find the best available block)
  for (const row of Object.values(rows)) {
    const available = row
      .filter((s) => s.seatStatus === "available")
      .sort((a, b) => a.seat_num - b.seat_num);

    for (let i = 0; i <= available.length - n; i++) {
      const segment = available.slice(i, i + n);
      // Check if all seats in the segment are contiguous (seat_num 5, 6, 7...)
      const contiguous = segment.every(
        (s, j, arr) => j === 0 || s.seat_num === arr[j - 1].seat_num + 1
      );
      if (contiguous) return segment.map((s) => s.seatId);
    }
  }

  // 4. If no block is found
  return [];
}

// --- Component Start ---
export default function BookingPage() {
  const { screeningId } = useParams<{ screeningId: string }>();
  const navigate = useNavigate();
  
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

  // Derived state (calculated from other state)
  const totalTickets = tickets.reduce((sum, t) => sum + t.count, 0);
  const totalPrice = tickets.reduce(
    (sum, t) => sum + t.count * (t.price ?? 0),
    0
  );

  // 1. Fetch all seats for this screening on load
  const {
    data: initialSeats,
    isLoading: isSeatsLoading,
    error,
  } = useFetch<Seat[]>(`/api/seatStatusView?screeningId=${screeningId}`);

  // This is the "live" state for seats, updated by SSE
  const [seats, setSeats] = useState<Seat[]>([]);

  // When initial seats are loaded, populate the live 'seats' state
  useEffect(() => {
    if (initialSeats) setSeats(initialSeats);
  }, [initialSeats]);

  // 2. Define API hooks
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

  // 3. Fetch peripheral screening info (poster, name, etc.)
  const { data: screening } = useFetch<
    {
      title: string;
      info: { mobileImg: string };
      startTime: string;
      auditoriumName: string;
    }[]
  >(`/api/screeningsInfo?screeningId=${screeningId}`, { skip: !screeningId });

  // 4. Main auto-seat-selection logic
  useEffect(() => {
    // Clear any previous errors when ticket count changes
    setSeatError(null);

    if (totalTickets === 0) {
      setSelectedSeats([]);
      return;
    }

    // Only run if the number of tickets doesn't match the selected seats
    if (selectedSeats.length !== totalTickets) {
      const best = findAdjacentSeats(seats, totalTickets);
      setSelectedSeats(best); // This will be [] if nothing is found

      // If the search failed, and seats have loaded, set an error
      if (best.length === 0 && seats.length > 0) {
        setSeatError(
          `Kunde tyvärr inte hitta ${totalTickets} sammanhängande platser. Prova ett färre antal eller dela upp din bokning.`
        );
      }
    }
  }, [seats, totalTickets]);

  // 5. SSE Event Handler: Called by <SeatSSE> when an update is received
  const handleSeatUpdate = (
    seatIds: number[],
    status: "booked" | "available"
  ) => {
    // Update the live 'seats' state
    setSeats((prev) =>
      prev.map((s) =>
        seatIds.includes(s.seatId) ? { ...s, seatStatus: status } : s
      )
    );

    setShow(true); // Show the toast notification

    if (status === "booked") {
      // If a seat became booked, remove it from our current selection
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

  // 6. Manual Seat Click Handler
  const handleSeatClick = (seatId: number, status: string) => {
    if (status === "booked" || !seats) return;

    // Clear any errors when the user takes manual control
    setSeatError(null);

    const best = findAdjacentSeats(seats, totalTickets, seatId);
    if (best.length === totalTickets) {
      setSelectedSeats(best);
    } else {
      // If the click didn't result in a valid selection
      setSeatError(
        `Kunde inte hitta ${totalTickets} platser i rad från den valda platsen.`
      );
      setSelectedSeats([]); // Clear selection
    }
  };

  // 7. Booking Submission Handler
  const handleBooking = async () => {
    // --- Validation Guards ---
    if (!totalTickets) return alert("Välj minst en biljett!");
    if (seatError) return alert(seatError); // Check for auto-select errors
    if (selectedSeats.length < totalTickets)
      return alert("Du har valt färre stolar än antal biljetter!");
    if (!user && !guestEmail)
      return alert("Ange din e-post för att boka som gäst.");

    // --- Data Transformation ---
    // Collapse duplicate ticket types (e.g., 1x Adult + 1x Adult = 2x Adult)
    const uniqueTickets = tickets.reduce(
      (acc, cur) => {
        const found = acc.find((t) => t.id === cur.id);
        if (found) found.count += cur.count;
        else acc.push({ ...cur });
        return acc;
      },
      [] as { id: number; count: number }[]
    );

    // Map selected seats to their corresponding ticket types
    const seatList: { seatId: number; ticketType: number }[] = [];
    const seatQueue = [...selectedSeats];
    for (const t of uniqueTickets) {
      for (let i = 0; i < t.count; i++) {
        const seatId = seatQueue.shift();
        if (seatId !== undefined) seatList.push({ seatId, ticketType: t.id });
      }
    }

    // Build the final payload for the API
    const bookingData = {
      screeningId: Number(screeningId),
      seats: seatList,
      guestEmail: user ? undefined : guestEmail,
    };

    // --- API Call ---
    try {
      const result = await postBooking(bookingData, "POST");
      const bookingNumber = result.bookingNumber; // Now correctly typed

      // (Optional) Get price breakdown, though it's not used
      const breakdown = await getPriceBreakdown(
        `/api/priceTotals?bookingId=${result.bookingId}`,
        "GET"
      );
      
      // Navigate to the public confirmation page
      navigate(`/Bekräftelse/${bookingNumber}`);
      
    } catch (err: any) {
      alert(`Kunde inte boka platser: ${err.message}`);
    }
  };

  // --- Render Logic ---
  if (isSeatsLoading || isAuthLoading) return <p>Laddar...</p>;
  if (error) return <p>Ett fel uppstod: {error}</p>;

  return (
    <main className="booking-page text-center xs-mb-5">
      {/* SSE listener component */}
      <SeatSSE
        onSeatUpdate={handleSeatUpdate}
        screeningId={Number(screeningId)}
      />
      
      <div className="booking-layout">
        {/* Left Column (Movie Info & Tickets) */}
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

        {/* Right Column (Seating & Booking) */}
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

          {/* Guest email field (only shown if logged out) */}
          {!user && totalTickets > 0 && (
            <div className="guest-email mb-3">
              <label className="form-label text-light">E-post</label>
              <input
                type="email"
                className="form-control"
                placeholder="namn@exempel.se"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
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

          {/* Error message for seat selection */}
          {seatError && (
            <p style={{ color: "red", marginTop: "15px" }}>{seatError}</p>
          )}

          {totalTickets > 0 && (
            <button className="btn neo-btn mt-4" onClick={handleBooking}>
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
          delay={3000}
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