import { useEffect, useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import MovieCard from "../components/MovieCard";
import { Movie } from "../types/movie";
import useFetch from "../hook/useFetch";
import "./PagesStyle/HomePage.scss";
import UpcomingMovies from "../components/UpcomingMovies";
import { useIsMobile } from "../hook/useIsMobile";
import { MovieCarousel } from "../components/MovieCarousel";
import { Stack } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export default function HomePage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { data, isLoading, error } = useFetch<Movie[]>("api/moviesWithGenres");
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const movies = Array.isArray(data)
    ? data.filter((m: Movie) => m && m.id && m.title)
    : [];

  const groups = chunk(movies, 1); // 1 card = 1 item
  const active = movies[activeIndex];
  // handling loading, error and empty states
  if (isLoading)
    return <div className="text-center text-light mt-5">Laddar filmer...</div>;

  if (error)
    return (
      <div className="text-center text-danger mt-5">
        Något gick fel: {error}
      </div>
    );

  return (
    <>
      {isMobile ? (
        <main className="container-fluid home-page">
          <section className="sticky-top header-box">
            {/* <img src="/NeoCinema.png" alt="NeoCinema loga" className="site-logo" /> */}
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
              type="button"
              onClick={() => active?.id && navigate(`/movie/${active.id}`)}
              disabled={!active?.id}
            >
              Köp biljetter
            </button>
          </section>
          <Carousel
            activeIndex={activeIndex}
            onSelect={(idx) => setActiveIndex(idx)}
            interval={null}
            indicators={true}
            controls={true}
            wrap={true}
          >
            {groups.map((grp, idx) => (
           <Carousel.Item key={grp[0].id}>
           <div className="d-flex justify-content-center">
           <Link
          to={`/movie/${grp[0].id}`}
            className="movie-card-link"
            aria-label={`Öppna ${grp[0].title}`}
           >
           <MovieCard movie={grp[0]} isActive={idx === activeIndex} />
           </Link>
           </div>
          </Carousel.Item>
            ))}
          </Carousel>
        </main>
      ) : (
        <Stack gap={4} className="fullscreen">
          <MovieCarousel movies={movies} />
          <UpcomingMovies />
        </Stack>
      )}
    </>
  );
}
