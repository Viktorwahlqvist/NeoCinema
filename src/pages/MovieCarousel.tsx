import { useRef } from "react";
import "./MovieCarousel.css";

interface MovieInfo {
  ageLimit: number;
  duration: number;
  mobileImg: string;
  desktopImg: string;
  description: string;
}

interface Movie {
  id: number;
  title: string;
  info: MovieInfo;
}

interface MovieCarouselProps {
  movies: Movie[];
}

export default function MovieCarousel({ movies }: MovieCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  return (
    <div className="carousel-container">
      <div className="carousel" ref={carouselRef}>
        {movies.map((movie) => (
          <div key={movie.id} className="movie-card">
            <img
              src={movie.info.mobileImg || "/placeholder.jpg"}
              alt={movie.title}
              className="movie-img"
            />
            <div className="movie-info">
              <h3>{movie.title}</h3>
              <p>{movie.info.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
