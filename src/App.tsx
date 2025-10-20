import { useState, useEffect } from "react";
import type { Movie } from "./types/movie";
// import MoviesList from './components/MovieList'
import MoviesPage from "./pages/MoviesPage";
import MovieCarousel from "./pages/MovieCarousel";
import "./styles/base.scss";
import AllMoviesPage from "./pages/AllMoviesPage";

function App() {
  return <AllMoviesPage />;

  // const [movies, setMovies] = useState<Movie[]>([]);

  // useEffect(() => {
  //   const fetchMovies = async () => {
  //     const res = await fetch("/api/movies");
  //     const data = await res.json();
  //     setMovies(data);
  //   };
  //   fetchMovies();
  // }, []);

  // return (
  //   <div>
  //     <h2 style={{ textAlign: "center" }}>Nu på bio</h2>
  //     <MovieCarousel movies={movies} />
  //   </div>
  // );
}

export default App;
