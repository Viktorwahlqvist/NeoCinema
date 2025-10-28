import { useState, useEffect } from "react";
import type { Movie } from "./types/movie";
import "./App.css";
import { MovieCarousel } from "./components/MovieCarousel";

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch("/api/movies");
        if (!res.ok) throw new Error("Kunde inte hämta filmer");
        const data = await res.json();
        setMovies(data);
      } catch (err) {
        console.error("Fel vid hämtning av filmer:", err);
      }
    };
    fetchMovies();
  }, []);

  return (
    <div className="App">
      <h2 className="section-title">Nu på bio</h2>
      <MovieCarousel movies={movies} />
    </div>
  );
}

export default App;
