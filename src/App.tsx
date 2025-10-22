<<<<<<< HEAD
import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import type { Movie } from "./types/movie";
// import MoviesList from './components/MovieList'
import MoviesPage from "./pages/MoviesPage";
import MovieCarousel from "./pages/MovieCarousel";
import "./styles/base.scss";
import AllMoviesPage from "./pages/AllMoviesPage";

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const fetchMovies = async () => {
      const res = await fetch("/api/movies");
      const data = await res.json();
      setMovies(data);
    };
    fetchMovies();
  }, []);

=======
import HomePage from "./pages/HomePage";
import BottomNavbar from "./components/BottomNavbar";
import './App.css';

function App() {
>>>>>>> origin/dev
  return (
    <>
      <HomePage />
      <BottomNavbar />
    </>
  );
}

export default App;
