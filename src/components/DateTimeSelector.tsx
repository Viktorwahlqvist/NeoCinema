import React, { useEffect, useMemo, useState } from "react";
import { Screening, Props } from "../types/screening";


// Helper: create a stable YYYY-MM-DD key in local (Stockholm) time
function dateKeyLocal(date: Date) {
  return date.toISOString().split("T")[0];
}

export default function DateTimeSelector({ movieId, limit = 50, onSelect }: Props) {
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch screenings when movieId or limit changes
  useEffect(() => {
    const controller = new AbortController();

    async function fetchScreenings() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/screenings/${movieId}?limit=${limit}`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Kunde inte hämta visningar");

        const data: Screening[] = await res.json();
        setScreenings(data);
      } catch (e: any) {
        if (e.name !== "AbortError") {
          setError(e?.message ?? "Något gick fel");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchScreenings();

    return () => controller.abort();
  }, [movieId, limit]);

    // Extract unique dates within the next 7 days
  const uniqueDateKeys = useMemo(() => {
    const now = new Date();
    const keys = new Set<string>();

    // only shows the uppcomming 7 days
    screenings.forEach((s) => {
      const date = new Date(s.start_time);
      const diffDays = (date.getTime() - now.getTime()) / 86400000;

      if (diffDays >= 0 && diffDays <= 7) {
        keys.add(dateKeyLocal(date));
      }
    });

    return [...keys].sort();
  }, [screenings]);

  // Screenings that match the currently selected date
  const timesForSelectedDate = useMemo(() => {
    if (!selectedDateKey) return [];

    return screenings
      .filter((s) => dateKeyLocal(new Date(s.start_time)) === selectedDateKey)
      .sort((a, b) => +new Date(a.start_time) - +new Date(b.start_time));
  }, [screenings, selectedDateKey]);

  // UI fallbacks
  if (loading) return <div className="date-time-selector loading text-light">Laddar visningar…</div>;
  if (error) return <div className="date-time-selector error alert alert-danger">{error}</div>;
  if (screenings.length === 0) return <div className="date-time-selector text-light">Inga visningar hittades.</div>;

  return (
    <section className="date-time-selector">

   {/* Date selection UI */}
      <div className="selector-box mb-3">
        <h3 className="heading mb-4">Välj datum</h3>

        <div className="dates-grid d-flex flex-wrap gap-3">
          {uniqueDateKeys.map((key) => {
            const label = new Date(key + "T12:00:00").toLocaleDateString("sv-SE", {
              weekday: "short",
              day: "2-digit",
              month: "short",
            });

            return (
              <button
                key={key}
                type="button"
                className={`date-btn ${selectedDateKey === key ? "active" : ""}`}
                onClick={() => setSelectedDateKey(key)}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

    {/* Time selection UI */}
      {selectedDateKey && (
        <div className="selector-box">
          <h4 className="heading-sm mb-4">Välj sal</h4>

          {timesForSelectedDate.length === 0 ? (
            <div className="no-times">Inga tider för valt datum.</div>
          ) : (
            <div className="times-grid d-flex flex-wrap gap-3">
              {timesForSelectedDate.map((s) => {
                const timeLabel = new Date(s.start_time).toLocaleTimeString("sv-SE", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <button
                    key={s.screening_id}
                    type="button"
                    className="time-btn"
                    onClick={() => onSelect?.(s)}
                  >
                    <div className="time">{timeLabel}</div>
                    <div className="auditorium">{s.auditorium}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
