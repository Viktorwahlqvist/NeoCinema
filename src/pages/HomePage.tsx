import { useEffect, useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import MovieCard from "../components/MovieCard";
import { Movie } from "../types/movie";
import "./HomePage.scss";

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetch("/api/moviesWithGenres")
      .then((r) => r.json())
      .then((data) => {
        const valid = Array.isArray(data) ? data.filter((m: Movie) => m && m.id && m.title) : [];
        setMovies(valid);
      })
      .catch(() => {});
  }, []);

  const groups = chunk(movies, 1); // 1 card = 1 item
  const active = movies[activeIndex];

  if (!movies.length) return <div className="text-center text-light mt-5">Laddar filmer...</div>;

  return (
    <div className="container-fluid home-page">
      <div className="sticky-top header-box">
        <img src="/NeoCinema.png" alt="NeoCinema loga" className="site-logo" />
        <h2 className="neon-text">{active?.title ?? ""}</h2>
        <div className="genre-row">
          {active?.genres?.map((g) => (
            <span key={g} className="genre-pill">{g}</span>
          ))}
        </div>
        <button className="btn neon-btn mt-2" onClick={() => alert(`Köp biljetter för ${active?.title}`)}>Köp biljetter</button>
      </div>

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
                  <MovieCard movie={grp[0]} isActive={idx === activeIndex} />
                </div>
              </Carousel.Item>
            ))}
    </Carousel>
    </div>
  );
}
