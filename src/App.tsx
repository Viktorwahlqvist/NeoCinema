import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AllMoviesPage from "./pages/AllMoviesPage";
import MovieDetailPage from "./pages/MovieDetailPage";
import BottomNavbar from "./components/BottomNavbar";
import BookingPage from "./pages/BookingPage"

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<AllMoviesPage />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route path="/booking/:screeningId" element={<BookingPage />} />
        </Routes>

        {/* BottomNavbar visas alltid, men vi döljer den på desktop */}
        <BottomNavbar />
      </div>
    </Router>
  );
}

export default App;
