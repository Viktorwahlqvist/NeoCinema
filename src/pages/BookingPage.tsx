import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useFetch from "../hook/useFetch";
import TicketSelector from "../components/TicketSelector";
import "./PagesStyle/BookingPage.scss";
import { useAuth } from "../AuthContext";
import SeatSSE from "../components/SeatSSE";

interface Seat {
  seatId: number;
  row_num: number;
  seat_num: number;
  seatStatus: "available" | "booked";
  auditoriumName: string;
  screeningId: number;
  start_time: string;
}
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

/* --------------  ADJACENT-SEAT HELPER -------------- */
function findAdjacentSeats(
  seats: Seat[],
  n: number,
  startSeatId?: number
): number[] {
  const rows = seats.reduce((acc: Record<number, Seat[]>, seat) => {
    if (!acc[seat.row_num]) acc[seat.row_num] = [];
    acc[seat.row_num].push(seat);
    return acc;
  }, {});

  if (startSeatId) {
    const clickedSeat = seats.find((s) => s.seatId === startSeatId);
    if (!clickedSeat) return [];
    const rowSeats = rows[clickedSeat.row_num]
      .filter((s) => s.seatStatus === "available")
      .sort((a, b) => a.seat_num - b.seat_num);
    const index = rowSeats.findIndex((s) => s.seatId === clickedSeat.seatId);
    const right = rowSeats.slice(index, index + n);
    if (right.length === n) return right.map((s) => s.seatId);
    const leftStart = Math.max(0, index - n + 1);
    const left = rowSeats.slice(leftStart, leftStart + n);
    if (left.length === n) return left.map((s) => s.seatId);
  }

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

// Component start
export default function BookingPage() {
  const { screeningId } = useParams<{ screeningId: string }>();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<
    { id: number; count: number; price?: number }[]
  >([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  const { user, isLoading: isAuthLoading } = useAuth();

  const [guestEmail, setGuestEmail] = useState("");
  const totalTickets = tickets.reduce((sum, t) => sum + t.count, 0);
  const totalPrice = tickets.reduce(
    (sum, t) => sum + t.count * (t.price ?? 0),
    0
  );

  // 1. seats for this screening
  const {
    data: initialSeats,
    isLoading: isSeatsLoading,
    error,
  } = useFetch<Seat[]>(`/api/seatStatusView?screeningId=${screeningId}`);

  const [seats, setSeats] = useState<Seat[]>([]);

  useEffect(() => {
    if (initialSeats) setSeats(initialSeats);
  }, [initialSeats]);

  // 3. price breakdown helper
  const { doFetch: postBooking } = useFetch<{
    bookingId: number;
    bookedSeats: number[];
  }>("/api/booking/bookings");

  const { doFetch: getPriceBreakdown } = useFetch<
    {
      ticketType: string;
      quantity: number;
      subTotal: number;
      totalPrice: number;
    }[]
  >("/api/priceTotals", { skip: true });

  // 4. screening info for poster / heading
  const { data: screening } = useFetch<
    {
      title: string;
      info: { mobileImg: string };
      startTime: string;
      auditoriumName: string;
    }[]
  >(`/api/screeningsInfo?screeningId=${screeningId}`, { skip: !screeningId });

  useEffect(() => {
    // If user havent selected any ticket types.
    if (totalTickets === 0) {
      setSelectedSeats([]);
      return;
    }
    // If user havent selected any seats, findAdjacentSeats.
    if (selectedSeats.length === 0) {
      const best = findAdjacentSeats(seats, totalTickets);
      setSelectedSeats(best);
    }
  }, [seats, totalTickets]);

  // If a seat has the same seatId as the one booked , update it to booked.
  const handleSeatUpdate = (seatId: number, status: "booked" | "available") => {
    setSeats((prev) =>
      prev.map((s) => (s.seatId === seatId ? { ...s, seatStatus: status } : s))
    );

    // Remove any seats from selectedSeats that are no longer available
    if (status === "booked") {
      setSelectedSeats((prev) => prev.filter((id) => id !== seatId));
    }
  };

  // (handleSeatClick är oförändrad)
  const handleSeatClick = (seatId: number, status: string) => {
    if (status === "booked" || !seats) return;
    const best = findAdjacentSeats(seats, totalTickets, seatId);
    if (best.length === totalTickets) setSelectedSeats(best);
  };

  // handleBooking form submission
  const handleBooking = async () => {
    if (!totalTickets) return alert("Välj minst en biljett!");
    if (selectedSeats.length < totalTickets)
      return alert("Du har valt färre stolar än antal biljetter!");
    if (!user && !guestEmail)
      return alert("Ange din e-post för att boka som gäst.");

    // collapse duplicates & build seatList
    const uniqueTickets = tickets.reduce((acc, cur) => {
      const found = acc.find((t) => t.id === cur.id);
      if (found) found.count += cur.count;
      else acc.push({ ...cur });
      return acc;
    }, [] as { id: number; count: number }[]);

    const seatList: { seatId: number; ticketType: number }[] = [];
    const seatQueue = [...selectedSeats];
    for (const t of uniqueTickets) {
      for (let i = 0; i < t.count; i++) {
        const seatId = seatQueue.shift();
        if (seatId !== undefined) seatList.push({ seatId, ticketType: t.id });
      }
    }
    // bygg bookingData, kollar om user är inloggad eller gäst
    const bookingData = {
      screeningId: Number(screeningId),
      seats: seatList,
      guestEmail: user ? undefined : guestEmail,
    };

    try {
      const result = await postBooking(bookingData, "POST");
      const bookingId = result.bookingId;

      const breakdown = await getPriceBreakdown(
        `/api/priceTotals?bookingId=${bookingId}`,
        "GET"
      );

      const lines = breakdown.map(
        (row) => `${row.quantity} × ${row.ticketType}  ${row.subTotal} kr`
      );

      navigate(`/Bekräftelse/${bookingId}`);
    } catch (err: any) {
      alert(`Kunde inte boka platser: ${err.message}`);
    }
  };

  // updated render
  if (isSeatsLoading || isAuthLoading) return <p>Laddar...</p>;
  if (error) return <p>Ett fel uppstod: {error}</p>;
  if (!seats?.length) return <p>Inga stolar hittades.</p>;

  return (
    <main className="booking-page text-center mb-5">
      {
        <SeatSSE
          onSeatUpdate={handleSeatUpdate}
          screeningId={Number(screeningId)}
        />
      }
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
                {new Date(screening[0].startTime).toLocaleString()}
              </h2>
            </div>
          )}
          <div className="screen">DUKEN</div>

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

          {totalTickets > 0 && (
            <button className="btn neon-btn mt-4" onClick={handleBooking}>
              Boka {totalTickets} biljett(er)
            </button>
          )}
        </section>
      </div>
    </main>
  );
}
