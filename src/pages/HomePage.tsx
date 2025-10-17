import { useEffect, useRef, useState } from "react";
import MovieCard from "../components/MovieCard";
import { Movie } from "../types/movie";
import "./HomePage.scss";

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0); // card most in view

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/movies")
      .then((r) => r.json())
      .then(setMovies)
      .finally(() => setIsLoading(false));
  }, []);

  /* ---- IntersectionObserver : mark centre card ---- */
  useEffect(() => {
    if (!movies.length) return;
    const cards = scrollRef.current?.querySelectorAll(".movie-card");
    if (!cards) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.6) {
            const idx = Array.from(cards).indexOf(e.target as Element);
            setActiveIndex(idx);
            break;
          }
        }
      },
      { root: scrollRef.current, threshold: 0.6 }
    );

    cards.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, [movies]);

  const active = movies[activeIndex];

  if (isLoading)
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

      {/*  CAROUSEL  */}
      <div className="movie-scroll" ref={scrollRef}>
        {movies.map((movie, idx) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            isActive={idx === activeIndex} 
          />
        ))}
      </div>
    </div>
  );
}