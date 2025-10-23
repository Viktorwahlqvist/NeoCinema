import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AllMoviesPage from "./pages/AllMoviesPage";
import MovieDetailPage from "./pages/MovieDetailPage";
import BottomNavbar from "./components/BottomNavbar";
// import BookingPage from "../pages/BookingPage";
import NavDesk from "./components/NavDesk";
import { useIsMobile } from "./hooks/useIsMobile";

function App() {
  const isMobile = useIsMobile();
  return (
    // <Router>
    //   <div className="app-container">
    //     <Routes>
    //       <Route path="/" element={<HomePage />} />
    //       <Route path="/movies" element={<AllMoviesPage />} />
    //       <Route path="/movie/:id" element={<MovieDetailPage />} />
    //       <Route path="/booking/:screeningId" element={<BookingPage />} />
    //     </Routes>

    //     {isMobile ? <BottomNavbar /> : <NavDesk />}
    //   </div>
    // </Router>
    <MovieDetailPage />
  );
}

export default App;
