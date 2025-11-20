import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./PagesStyle/ProfilePage.scss";
import { formatScreeningTime } from "../utils/date";
import { Booking } from "../types/Booking";
import ConfirmCancelModal from "../components/ConfirmCancelModal";


export default function ProfilePage() {
  const navigate = useNavigate();
  // get user state from AuthContext
  const { user, isLoading: isAuthLoading, logout: authLogout } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true); // only for bookings

  const [cancelStatus, setCancelStatus] = useState<{
    id: number | null;
    loading: boolean;
    error: string | null;
  }>({
    id: null,
    loading: false,
    error: null,
  });

  const [modalState, setModalState] = useState<{
    show: boolean;
    bookingId: number | null;
    bookingTitle: string | null;
  }>({
    show: false,
    bookingId: null,
    bookingTitle: null,
  });


  useEffect(() => {
    // wait until Auth is done loading
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    fetch("/api/users/me/bookings", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Kunde inte hämta bokningar");
        return res.json();
      })
      .then((bookingsData) => {
        setBookings(bookingsData.bookings);
      })
      .catch((error) => {
        console.error("Kunde inte hämta profildata:", error);

      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, isAuthLoading, navigate]);

  const logout = async () => {
    try {
      await fetch("/api/users/logout", {
        method: "POST",
        credentials: "include",
      });
      authLogout(); // update global auth state
    } catch (err) {
      console.error("Utloggning misslyckades:", err);
    }
    navigate("/");
  };

  const openCancelModal = (bookingId: number, bookingTitle: string) => {
    setModalState({
      show: true,
      bookingId,
      bookingTitle,
    });
  };


  const handleCancel = async () => {
    if (!modalState.bookingId) return;

    setCancelStatus({ id: modalState.bookingId, loading: true, error: null });

    try {
      const res = await fetch(`/api/booking/${modalState.bookingId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.error || `Avbokning misslyckades (status ${res.status})`
        );
      }

      setBookings((prev) =>
        prev.filter((b) => b.bookingId !== modalState.bookingId)
      );

      setCancelStatus({ id: null, loading: false, error: null });
      setModalState({ show: false, bookingId: null, bookingTitle: null }); // close modal
    } catch (err: any) {
      console.error(err);
      setCancelStatus({
        id: modalState.bookingId,
        loading: false,
        error: err.message,
      });
    }
  };


  const canCancel = (screeningTime: string) => {
    const screeningDate = new Date(screeningTime);
    const twoHoursBefore = screeningDate.getTime() - 2 * 60 * 60 * 1000;
    return Date.now() < twoHoursBefore;
  };

  const { upcomingBookings, pastBookings } = useMemo(() => {
    const now = Date.now();
    const upcoming: Booking[] = [];
    const past: Booking[] = [];

    for (const b of bookings) {
      if (new Date(b.screeningTime).getTime() > now) {
        upcoming.push(b);
      } else {
        past.push(b);
      }
    }

    upcoming.sort(
      (a, b) =>
        new Date(a.screeningTime).getTime() - new Date(b.screeningTime).getTime()
    );
    past.sort(
      (a, b) =>
        new Date(b.screeningTime).getTime() - new Date(a.screeningTime).getTime()
    );

    return { upcomingBookings: upcoming, pastBookings: past };
  }, [bookings]);


  if (loading || isAuthLoading) return <p>Laddar...</p>;
  if (!user) return null;


  const BookingCard = ({ booking }: { booking: Booking; }) => {
    const isCancellable = canCancel(booking.screeningTime);
    const isThisCancelling =
      cancelStatus.loading && cancelStatus.id === booking.bookingId;

    return (
      <div
        key={booking.bookingId}
        style={{
          border: "1px solid #ccc",
          borderRadius: 6,
          padding: 12,
          marginBottom: 12,
          opacity: isThisCancelling ? 0.5 : 1,
        }}
      >
        <strong>{booking.movieTitle}</strong> — {booking.auditoriumName}
        <br />
        {formatScreeningTime(booking.screeningTime)}
        <br />
        Bokningsnummer: <code>{booking.bookingNumber}</code>
        <br />
        Totalt: {booking.totalPrice} kr
        <br />
        {isCancellable && (
          <button
            onClick={() => openCancelModal(booking.bookingId, booking.movieTitle)}
            disabled={isThisCancelling}
            style={{
              marginTop: 8,
              color: "red",
              background: "none",
              border: "1px solid red",
              cursor: "pointer",
            }}
          >
            {isThisCancelling ? "Avbokar..." : "Avboka"}
          </button>
        )}
        {cancelStatus.error && cancelStatus.id === booking.bookingId && (
          <p style={{ color: "red", fontSize: "0.9em" }}>
            {cancelStatus.error}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="profile-container xs-mb-5">
      <h2>Hej, {user.firstName}</h2>
      <p>E-post: {user.email}</p>
      <button className="logout-btn" onClick={logout}>Logga ut</button>
      
      {user?.role === "admin" && (<button className="adminButton" onClick={() => navigate("/admin")}>Adminpanel</button>)}

      <h3 className="section-title">Kommande bokningar</h3>
      {upcomingBookings.length === 0 && (
        <p className="empty-text">Du har inga kommande bokningar.</p>
      )}
      {upcomingBookings.map((b) => (
        <div key={b.bookingId} className="booking-card">
          <strong>{b.movieTitle}</strong> — {b.auditoriumName}<br />
          Datum: {formatScreeningTime(b.screeningTime)}<br />
          Bokningsnummer: <code>{b.bookingNumber}</code><br />
          Totalt: {b.totalPrice} kr<br />

          {canCancel(b.screeningTime) && (
            <button
              className="cancel-btn"
              onClick={() => openCancelModal(b.bookingId, b.movieTitle)}

              disabled={cancelStatus.loading && cancelStatus.id === b.bookingId}
            >
              {cancelStatus.loading && cancelStatus.id === b.bookingId
                ? "Avbokar..."
                : "Avboka"}
            </button>
          )}

          {cancelStatus.error && cancelStatus.id === b.bookingId && (
            <p className="cancel-error">{cancelStatus.error}</p>
          )}
        </div>
      ))}

      <h3 className="section-title">Tidigare bokningar</h3>
      {pastBookings.length === 0 && (
        <p className="empty-text">Du har inga tidigare bokningar.</p>
      )}
      {pastBookings.map((b) => (
        <div key={b.bookingId} className="booking-card">
          <strong>{b.movieTitle}</strong> — {b.auditoriumName}<br />
          Datum: {formatScreeningTime(b.screeningTime)}<br />
          Bokningsnummer: <code>{b.bookingNumber}</code><br />
          Totalt: {b.totalPrice} kr
        </div>
      ))}


      <ConfirmCancelModal
        show={modalState.show}
        onClose={() =>
          setModalState({ show: false, bookingId: null, bookingTitle: null })
        }
        onConfirm={handleCancel}
        bookingTitle={modalState.bookingTitle || ""}
      />
    </div>
  );

}