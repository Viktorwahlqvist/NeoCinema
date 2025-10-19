import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import type { Movie } from "./types/movie";
import './App.css'
// import MoviesList from './components/MovieList'
import MoviesPage from './pages/MoviesPage'
import MovieCarousel from './pages/MovieCarousel'
import BookingConfirmation from "./pages/BookingConfirmation";


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
  <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <h2 style={{ textAlign: "center" }}>Nu på bio</h2>
              <MovieCarousel movies={movies} />
            </div>
          }
        />
        <Route path="/Bekräftelse/:bookingId" element={<BookingConfirmation />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App
