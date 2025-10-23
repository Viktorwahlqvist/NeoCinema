import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useFetch from "../hook/useFetch";
import TicketSelector from "../components/TicketSelector";
import "./BookingPage.scss";

// function for finding adjacent seats
function findAdjacentSeats(seats: Seat[], n: number, startSeatId?: number): number[] {
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
      const contiguous = segment.every((s, j, arr) =>
        j === 0 ? true : s.seat_num === arr[j - 1].seat_num + 1
      );
      if (contiguous) return segment.map((s) => s.seatId);
    }
  }
  return [];
}

/* ----------  types ---------- */
interface Seat {
  seatId: number;
  row_num: number;
  seat_num: number;
  seatStatus: "available" | "booked";
  auditoriumName: string;
  screeningId: number;
  start_time: string;
}

export default function BookingPage() {
  const { screeningId } = useParams<{ screeningId: string }>();
  const navigate = useNavigate();

  /* 🔹 tickets from selector -------------------------------------------- */
  const [tickets, setTickets] = useState<{ id: number; count: number }[]>([]);
  const totalTickets = tickets.reduce((sum, t) => sum + t.count, 0);

  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  /* 🔹 data -------------------------------------------------------------- */
  const { data: seats, isLoading, error } = useFetch<Seat[]>(
    `/api/seatStatusView?screeningId=${screeningId}`
  );

  const { doFetch: postBooking } = useFetch<{ bookedSeats: number[]; bookingId: number }>(
    "/api/bookings"
  );

  const { doFetch: getPriceBreakdown } = useFetch<{
    ticketType: string;
    quantity: number;
    subTotal: number;
    totalPrice: number;
  }[]>("/api/priceTotals", { skip: true }); // skip until we have bookingId

  // auto-select seats when tickets change
  useEffect(() => {
    if (!seats || totalTickets === 0) {
      setSelectedSeats([]);
      return;
    }
    const best = findAdjacentSeats(seats, totalTickets);
    setSelectedSeats(best);
  }, [seats, totalTickets]);

  // seat click handler
  const handleSeatClick = (seatId: number, status: string) => {
    if (status === "booked") return;
    if (!seats) return;
    const best = findAdjacentSeats(seats, totalTickets, seatId);
    if (best.length === totalTickets) setSelectedSeats(best);
  };

  
  const handleBooking = async () => {
    if (!totalTickets) return alert("Välj minst en biljett!");

    // expand tickets → one seat per ticket (adults first, then children, etc.)
    const seatList: { seatId: number; ticketType: number }[] = [];
    const seatQueue = [...selectedSeats]; 
    for (const t of tickets) {
      for (let i = 0; i < t.count; i++) {
        seatList.push({ seatId: seatQueue.shift()!, ticketType: t.id });
      }
    }

    const bookingData = {
      screeningId: Number(screeningId),
      userId: 6,
      seats: seatList,
    };

    try {
      
      const result = await postBooking(bookingData, "POST");
      const bookingId = result.bookingId;

      const breakdown = await getPriceBreakdown(
        `/api/priceTotals?bookingId=${bookingId}`,
        "GET"
      );

      // Alert, Only temporary way to show booking summary until confirmation page is done
      const lines = breakdown.map(
        (row) => `${row.quantity} × ${row.ticketType}  ${row.subTotal} kr`
      );
      const total = breakdown[0]?.totalPrice ?? 0;

      const msg = [
        `Bokningen lyckades! 🎬`,
        ``,
        `Platser: ${result.bookedSeats.join(", ")}`,
        ``,
        ...lines,
        ``,
        `Total: ${total} kr`,
      ].join("\n");

      alert(msg);
      navigate("/movies");
    } catch (err: any) {
      alert(`Kunde inte boka platser: ${err.message}`);
    }
  };

  // rendering and wrong states
  if (isLoading) return <p>Laddar stolar...</p>;
  if (error) return <p>Ett fel uppstod: {error}</p>;
  if (!seats?.length) return <p>Inga stolar hittades.</p>;

  return (
    <main className="booking-page text-center">
      <h2 className="neon-text mb-4">
        {seats[0]?.auditoriumName} – {new Date(seats[0]?.start_time).toLocaleString()}
      </h2>

      <div className="screen">DUKEN</div>

      {/* Ticket selector */}
      <div className="ticket-section mb-4">
        <h5 className="neon-text">Välj biljetter</h5>
        <TicketSelector onTicketChange={setTickets} />
      </div>

      <section className="seating-area">
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
                    className={`seat ${seat.seatStatus === "booked" ? "booked" : ""} ${
                      selectedSeats.includes(seat.seatId) ? "selected" : ""
                    }`}
                    onClick={() => handleSeatClick(seat.seatId, seat.seatStatus)}
                  >
                    {seat.seatId}
                  </button>
                ))}
            </div>
          ))}
      </section>

      {totalTickets > 0 && (
        <button className="btn neon-btn mt-4" onClick={handleBooking}>
          Boka {totalTickets} biljett(er)
        </button>
      )}
    </main>
  );
}