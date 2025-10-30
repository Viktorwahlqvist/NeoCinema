import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import useFetch from "../hook/useFetch";
import "./PagesStyle/ProfilePage.scss";

interface Booking {
  bookingId: number;
  movieTitle: string;
  screeningTime: string;
  auditoriumName: string;
  totalPrice: number;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: bookings, isLoading, error, doFetch } = useFetch<Booking[]>(
    "/api/bookings/history",
    { skip: !user } // only fetch when logged in
  );

  /* ---------- delete booking ---------- */
  const handleCancel = async (bookingId: number, screeningTime: string) => {
    const screening = new Date(screeningTime);
    const now = new Date();
    const msUntil = screening.getTime() - now.getTime();
    const hoursUntil = msUntil / (1000 * 60 * 60);

    if (hoursUntil < 2) {
      alert("Du kan bara avboka senast 2 timmar innan visningen.");
      return;
    }
    if (!confirm("Avboka denna bokning?")) return;

    try {
      await fetch(`/api/bookings/${bookingId}`, { method: "DELETE" });
      alert("Bokningen är avbokad – platserna är nu lediga igen.");
      await doFetch(undefined, "GET"); // re-fetch list
    } catch (err: any) {
      alert(`Kunde inte avboka: ${err.message}`);
    }
  };

  if (!user) return <p>Du måste logga in för att se denna sida.</p>
  if (isLoading) return <p>Laddar bokningar…</p>
  if (error) return <p>Ett fel uppstod: {error}</p>
  if (!bookings?.length) return <p>Du har inga bokningar ännu.</p>

  const now = new Date();

  return (
    <main className="profile-page text-center">
      <h2 className="neon-text mb-3">Hej {user.firstName} 👋</h2>
      <button className="btn neon-btn mb-4" onClick={logout}>
        Logga ut
      </button>

      <h3 className="neon-text mb-4">Dina bokningar</h3>

      <div className="booking-history">
        {bookings.map((b) => {
          const screening = new Date(b.screeningTime);
          const msUntil = screening.getTime() - now.getTime();
          const hoursUntil = msUntil / (1000 * 60 * 60);
          const canCancel = hoursUntil >= 2;

          return (
            <article key={b.bookingId} className="booking-card">
              <h4 className="neon-text">{b.movieTitle}</h4>
              <p>{b.auditoriumName} – {new Date(b.screeningTime).toLocaleString()}</p>
              <p className="price">Totalt: {b.totalPrice} kr</p>

              {canCancel && (
                <button
                  className="btn btn-danger neon-btn-cancel mt-2"
                  onClick={() => handleCancel(b.bookingId, b.screeningTime)}
                >
                  Avboka
                </button>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}