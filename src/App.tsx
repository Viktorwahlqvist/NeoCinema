import { useState, useEffect } from "react";
import type { Movie } from "./types/movie";
import './App.css'
// import MoviesList from './components/MovieList'
//import MoviesPage from './pages/MoviesPage'
//import MovieCarousel from './pages/MovieCarousel'
import NeoNavbar from './components/NeoNavbar'
import OmNeo from './pages/OmNeo';
//import { Route, Routes } from "react-router-dom";




import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AllMoviesPage from "./pages/AllMoviesPage";
import MovieDetailPage from "./pages/MovieDetailPage";
import BottomNavbar from "./components/BottomNavbar";
import BookingPage from "./pages/BookingPage";
import NavDesk from "./components/NavDesk";
import { useIsMobile } from "./hook/useIsMobile";


function App() {
  const isMobile = useIsMobile();
  return (

   <Router>
    {!isMobile && <NavDesk />}
      <div className="app-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<AllMoviesPage />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route path="/booking/:screeningId" element={<BookingPage />} />
          <Route path="/om-oss" element={<OmNeo />} />
        </Routes>

        {isMobile && <BottomNavbar />}
      </div>
    </Router>
  );
}
export default App;
