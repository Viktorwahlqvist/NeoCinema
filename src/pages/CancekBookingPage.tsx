import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatScreeningTime } from "../../server/utils/date";
import "./PagesStyle/CancelBookingPage.scss"; 

type BookingDetails = {
  movieTitle: string;
  screeningTime: string;
};

// Component for cancelling a booking
export default function CancelBookingPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelled, setIsCancelled] = useState(false);

  
  useEffect(() => {
    if (!token) {
      setError("Ingen avboknings-token angiven.");
      setIsLoading(false);
      return;
    }

    fetch(`/api/booking/cancel-details/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Länken är ogiltig eller har gått ut.");
        }
        return res.json();
      })
      .then((data: BookingDetails) => {
        setBooking(data);
      })
      .catch((err: any) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token]);

  // function to handle the actual cancellation
  const handleConfirmCancel = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/booking/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Avbokningen misslyckades.");
      }

      setIsCancelled(true); // Show success message
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  

  return (
  <div className="cancel-booking-page">
    <div className="cancel-box">
      {isLoading && !booking && <p>Laddar...</p>}

      {error && (
        <>
          <h2>Något gick fel</h2>
          <p className="error">{error}</p>
          <button className="btn-cancel" onClick={() => navigate("/")}>
            Till startsidan
          </button>
        </>
      )}

      {isCancelled && (
        <>
          <h2 className="success">Bokning avbokad</h2>
          <p>
            Din bokning för <strong>{booking?.movieTitle}</strong> har avbokats.
          </p>
          <button className="btn-cancel" onClick={() => navigate("/")}>
            Till startsidan
          </button>
        </>
      )}

      {!isCancelled && booking && !error && (
        <>
          <h2>Bekräfta avbokning</h2>
          <p>Vill du verkligen avboka din bokning för:</p>
          <h3>{booking.movieTitle}</h3>
          <p>{formatScreeningTime(booking.screeningTime)}</p>
          <button
            className="btn-confirm"
            onClick={handleConfirmCancel}
            disabled={isLoading}
          >
            {isLoading ? "Avbokar..." : "Ja, avboka"}
          </button>
          <button
            className="btn-cancel"
            onClick={() => navigate("/")}
            disabled={isLoading}
          >
            Nej, gå tillbaka
          </button>
        </>
      )}
    </div>
  </div>
);
}