import { useState, useEffect } from "react";
import type { Movie } from "./types/movie";
import './App.css'
// import MoviesList from './components/MovieList'
import MoviesPage from './pages/MoviesPage'
import MovieCarousel from './pages/MovieCarousel'
import NeoNavbar from './components/NeoNavbar'


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

  return (
<>

  <NeoNavbar />
    </>
  );
};

export default App
