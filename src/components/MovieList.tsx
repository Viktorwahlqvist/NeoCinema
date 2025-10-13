import { useEffect, useState } from "react";

interface Movie {
  id: number;
  title: string;
  genres: string;
  info: {
    duration: number;
    description: string;
    release_date: string;
    age_limit: string;
  };
}

export default function MoviesList() {
  const [movies, setMovies] = useState<Movie[]>([]);

useEffect(() => {
  fetch("/api/movies")
    .then((res) => res.json())
    .then((data) => {
      console.log("🎬 Data från API:", data);
      setMovies(data);
    })
    .catch((err) => console.error("❌ Error fetching movies:", err));
}, []);

  return (
    <section className="movies">
      {movies.length === 0 ? (
        <p>Laddar filmer...</p>
      ) : (
        movies.map((movie) => (
          <article key={movie.id} className="movie-card">
            <h2>{movie.title}</h2>
            <p><strong>Genre:</strong> {movie.genres}</p>
            <p><strong>Beskrivning:</strong> {movie.info.description}</p>
            <p><strong>Längd:</strong> {movie.info.duration} min</p>
          </article>
        ))
      )}
    </section>
  );
}
