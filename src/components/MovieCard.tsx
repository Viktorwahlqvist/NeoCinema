import { Movie } from "../types/movie";
import "./Style/MovieCard.scss";

interface MovieCardProps {
  movie: Movie;
  isActive: boolean;
}

export default function MovieCard({ movie, isActive }: MovieCardProps) {
  return (
    <div className={`movie-card ${isActive ? "active" : ""}`}>
      <img
        src={movie.info?.mobileImg || "/placeholder.jpg"}
        alt={movie.title}
        className="card-poster"
      />
    </div>
  );
}