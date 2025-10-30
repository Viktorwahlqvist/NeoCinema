import Carousel from "react-bootstrap/Carousel";
import type { Movie } from "../types/movie";
import "./style/MovieCarousel.scss";
import FiltrBtn from "./filter/FilterBtn";
import { useState } from "react";
import FilterBtn from "./filter/FilterBtn";
import { Link } from "react-router-dom";

interface MovieCarouselProps {
  movies: Movie[];
}

export const MovieCarousel = ({ movies }: MovieCarouselProps) => {
  const [index, setIndex] = useState(0);
  const [filterGenre, setFiltereGenre] = useState<string | null>(null);

  const genres = ["Action", "Drama", "Thriller", "Sci-Fi"];

  const handleSelect = (selectedIndex: number) => {
    setIndex(selectedIndex);
  };

  const handleGenreFilter = (genre: string) => {
    setFiltereGenre(genre);
    setIndex(0);
  };

  console.log(filterGenre);

  const filteredMovies = filterGenre
    ? movies.filter((movie) => movie.genres.includes(filterGenre))
    : movies;

  const active = filteredMovies[Math.min(index, filteredMovies.length - 1)];
  if (!movies.length) {
    return (
      <div className="movie-carousel">
        <p style={{ textAlign: "center", color: "#00ffff" }}>
          Laddar filmer...
        </p>
      </div>
    );
  }

  return (
    <div className="movie-carousel ">
      <h2 className="neon-text">{active?.title ?? ""}</h2>
      <div className="genre-row">
        {active?.genres?.map((g) => (
          <span key={g} className="genre-pill">
            {g}
          </span>
        ))}
      </div>
      <Carousel
        key={filterGenre ?? "all"}
        interval={4000}
        controls={true}
        indicators={false}
        onSelect={handleSelect}
      >
        {filteredMovies.map((movie) => (
          <Carousel.Item key={movie.id}>
            <Link to={`/movie/${movie.id}`}>
              <img
                className="d-block w-100 carousel-img"
                src={movie.info.desktopImg || "/fallback-image.jpg"}
                alt={movie.title}
              />
            </Link>
          </Carousel.Item>
        ))}
      </Carousel>

      <div className="genre-buttons">
        <FilterBtn btnName={genres} onClick={handleGenreFilter} />
      </div>
    </div>
  );
};
