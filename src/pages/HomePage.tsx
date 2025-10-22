import { useEffect, useRef, useState } from "react";
import MovieCard from "../components/MovieCard";
import { Movie } from "../types/movie";
import "./HomePage.scss";

const CLONES = 2; // how many duplicates at each end (≥ 2 recommended)

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [activeIndex, setActiveIndex] = useState(CLONES);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/movies")
      .then((r) => r.json())
      .then((data) => {
        // filtrera bort null-rader om det finns några
        const valid = data.filter((m: Movie) => m && m.id && m.title);
        setMovies(valid);
      })
      .catch(() => {});
  }, []);

  const infinite = movies.length
    ? [
        ...movies.slice(-CLONES),
        ...movies,
        ...movies.slice(0, CLONES),
      ]
    : [];

  
    // --- IntersectionObserver ---
  useEffect(() => {
    if (!scrollRef.current || !movies.length) return;
    const cards = scrollRef.current.querySelectorAll<HTMLElement>(".movie-card");

    const obs = new IntersectionObserver(
      (entries) => {
        if ((window as any).isTeleporting) return; // 🚫 stoppa under teleport
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.6) {
            const idx = Array.from(cards).indexOf(e.target as HTMLElement);
            const origIdx = (idx - CLONES + movies.length) % movies.length;
            setActiveIndex(origIdx);
            console.log("Active index:", origIdx, movies[origIdx]?.title);
            break;
          }
        }
      },
      { root: scrollRef.current, threshold: 0.6 }
    );

    cards.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, [movies]);

  // --- teleport ---
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !movies.length) return;

    let teleTimeout: number;
    (window as any).isTeleporting = false;

    const onScrollEnd = () => {
      const scrollLeft = el.scrollLeft;
      const maxScroll = el.scrollWidth - el.clientWidth;

      const firstCard = el.querySelector<HTMLElement>(".movie-card");
      const cardWidth = firstCard?.getBoundingClientRect().width ?? 0;

      const totalWidth = cardWidth * movies.length;
      const nearLeftEdge = scrollLeft < cardWidth * CLONES - cardWidth / 2;
      const nearRightEdge = scrollLeft > maxScroll - cardWidth * CLONES + cardWidth / 2;

      if (nearLeftEdge || nearRightEdge) {
        (window as any).isTeleporting = true;

        requestAnimationFrame(() => {
          if (nearLeftEdge) {
            el.scrollLeft = scrollLeft + totalWidth;
          } else if (nearRightEdge) {
            el.scrollLeft = scrollLeft - totalWidth;
          }

          // vänta 300ms innan vi tillåter observern igen
          setTimeout(() => ((window as any).isTeleporting = false), 300);
        });
      }
    };

    const onScroll = () => {
      clearTimeout(teleTimeout);
      teleTimeout = window.setTimeout(onScrollEnd, 150);
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [movies]);


  /* ---- initial scroll to start ---- */
  useEffect(() => {
    if (scrollRef.current && movies.length) {
      const cardWidth = scrollRef.current.querySelector<HTMLElement>(".movie-card")?.offsetWidth || 0;
      scrollRef.current.scrollLeft = cardWidth * CLONES;
    }
  }, [movies]);

  const active = movies[activeIndex];

  if (!movies.length)
    return <div className="text-center text-light mt-5">Laddar filmer...</div>;

  return (
    <div className="container-fluid home-page">
      <div className="sticky-top header-box">
        <h2 className="neon-text">{active?.title ?? ""}</h2>
        <div className="genre-row">
          {active?.genres?.map((g) => (
            <span key={g} className="genre-pill">
              {g}
            </span>
          ))}
        </div>
        <button
          className="btn neon-btn mt-2"
          onClick={() => alert(`Buy tickets for ${active?.title}`)}
        >
          Köp biljetter
        </button>
      </div>

      {/* ---- infinite scroll row ---- */}
      <div className="movie-scroll" ref={scrollRef}>
        {infinite.map((movie, i) => (
          <MovieCard
            key={`${movie.id}-${i}`} // unikt för kloner
            movie={movie}
            isActive={(i - CLONES + movies.length) % movies.length === activeIndex}
          />
        ))}
      </div>
    </div>
  );
}
