import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./BookingPage.scss";

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
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Hämtar alla säten - ändras till hook senare
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const res = await fetch(`/api/seatStatusView?screeningId=${screeningId}`);
        if (!res.ok) throw new Error("Fel vid hämtning av säten");
        const data = await res.json();
        setSeats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSeats();
  }, [screeningId]);

  // Hanterar klick på stolar
  const toggleSeat = (id: number, status: string) => {
    if (status === "booked") return;
    setSelectedSeats((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // POST-bokning- Vi hårdkodar userId och ticket type tills att det implementeras ordentligt
  const handleBooking = async () => {
    if (!selectedSeats.length) return alert("Välj minst en stol först!");

    const bookingData = {
      screeningId: Number(screeningId),
      userId: 6, 
      seats: selectedSeats.map((id) => ({
        seatId: id,
        ticketType: 1, 
      })),
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Bokningen misslyckades");
      }

      
      alert(
        `Bokningen lyckades! 🎬\nBokade platser: ${data.bookedSeats.join(", ")}`
      );

      // Gå tillbaka till AllMoviesPage - ska inte vara med, bara för demo
      navigate("/movies");

    } catch (err: any) {
      console.error("Fel vid bokning:", err);
      alert(`Kunde inte boka platser: ${err.message}`);
    }
  };

  // Gruppera stolar per rad
  const rows = seats.reduce((acc: Record<number, Seat[]>, seat) => {
    if (!acc[seat.row_num]) acc[seat.row_num] = [];
    acc[seat.row_num].push(seat);
    return acc;
  }, {});

  if (loading) return <p>Laddar stolar...</p>;
  if (error) return <p>Ett fel uppstod: {error}</p>;

  return (
    <main className="booking-page text-center">
      <h2 className="neon-text mb-4">
        {seats[0]?.auditoriumName} – {new Date(seats[0]?.start_time).toLocaleString()}
      </h2>

      <div className="screen"> DUKEN </div>

      <section className="seating-area">
        {Object.keys(rows)
          .sort((a, b) => Number(a) - Number(b))
          .map((row) => (
            <div key={row} className="seat-row">
              {rows[Number(row)]
                .sort((a, b) => a.seat_num - b.seat_num)
                .map((seat) => (
                  <button
                    key={seat.seatId}
                    className={`seat 
                      ${seat.seatStatus === "booked" ? "booked" : ""} 
                      ${selectedSeats.includes(seat.seatId) ? "selected" : ""}`}
                    onClick={() => toggleSeat(seat.seatId, seat.seatStatus)}
                  >
                    {seat.seatId}
                  </button>
                ))}
            </div>
          ))}
      </section>

      {selectedSeats.length > 0 && (
        <button className="btn neon-btn mt-4" onClick={handleBooking}>
          Boka {selectedSeats.length} plats(er)
        </button>
      )}
    </main>
  );
}
