import React, { useEffect, useMemo, useState } from "react";

type Screening = {
  screening_id: number;
  movie_id: number;
  auditorium: string;
  start_time: string;
};


type Props = {
  movieId: number;
  limit?: number; // valfritt, default 50
  onSelect?: (screening: Screening) => void; // valfritt callback när tid väljs
};

// Hjälpare: gör en stabil YYYY-MM-DD-nyckel i lokal tid (Stockholm)
function dateKeyLocal(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function DateTimeSelector({ movieId, limit = 50, onSelect }: Props) {
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function run() {
      setLoading(true);
      setErr(null);
      try {
        // Viktigt: din router är /api/movieScreenings/:movieId?limit=...
const res = await fetch(`/api/screenings/${movieId}?limit=${limit}`);
        if (!res.ok) throw new Error("Kunde inte hämta visningar");
        const data: Screening[] = await res.json();
        if (!alive) return;
        setScreenings(data);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message ?? "Något gick fel");
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [movieId, limit]);

  const uniqueDateKeys = useMemo(() => {
  const keys = new Set<string>();
  screenings.forEach((s) => {
    const date = new Date(s.start_time);
    const now = new Date();

    // Visa bara kommande 7 dagar (ändra "7" om du vill)
    const diffDays = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays >= 0 && diffDays <= 7) {
      keys.add(dateKeyLocal(date));
    }
  });

  return Array.from(keys).sort();
}, [screenings]);


  // Filtrera visningar för valt datum
  const timesForSelectedDate = useMemo(() => {
    if (!selectedDateKey) return [];
    return screenings
      .filter((s) => dateKeyLocal(new Date(s.start_time)) === selectedDateKey)
      .sort((a, b) => +new Date(a.start_time) - +new Date(b.start_time));
  }, [screenings, selectedDateKey]);

  if (loading) return <div className="date-time-selector loading text-light">Laddar visningar…</div>;
  if (err) return <div className="date-time-selector error alert alert-danger">{err}</div>;
  if (screenings.length === 0) return <div className="date-time-selector text-light">Inga visningar hittades.</div>;

  return (
  <section className="date-time-selector">
    {/* Datumväljare */}
    <div className="selector-box mb-3">
      <h3 className="heading mb-3">Välj datum</h3>

      <div className="dates-grid d-flex flex-wrap gap-3">
        {uniqueDateKeys.map((key) => {
          const label = new Date(key + "T12:00:00").toLocaleDateString("sv-SE", {
            weekday: "short",
            day: "2-digit",
            month: "short",
          });
          const active = selectedDateKey === key;

          return (
            <button
              key={key}
              type="button"
              className={`date-btn ${active ? "active" : ""}`}
              onClick={() => setSelectedDateKey(key)}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>

    {/* Tidsväljare */}
    {selectedDateKey && (
      <div className="selector-box">
        <h4 className="heading-sm mb-3">Välj sal</h4>

        {timesForSelectedDate.length === 0 ? (
          <div className="no-times">Inga tider för valt datum.</div>
        ) : (
          <div className="times-grid d-flex flex-wrap gap-3">
            {timesForSelectedDate.map((s) => {
              const local = new Date(s.start_time);
              const timeLabel = local.toLocaleTimeString("sv-SE", {
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
