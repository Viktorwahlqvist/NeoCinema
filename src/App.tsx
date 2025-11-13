import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AllMoviesPage from "./pages/AllMoviesPage";
import MovieDetailPage from "./pages/MovieDetailPage";
import AboutUs from "./pages/AboutUs";
import KioskPage from "./pages/KioskPage";
import BottomNavbar from "./components/BottomNavbar";
import BookingPage from "./pages/BookingPage";
import BookingConfirmation from "./pages/BookingConfirmation";
import NavDesk from "./components/NavDesk";
import { useIsMobile } from "./hook/useIsMobile";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CancelBookingPage from "./pages/CancekBookingPage";
import CookieModal from "./components/CookieModal";

function App() {
  const isMobile = useIsMobile();
  return (
    <>
    <CookieModal/>
      {!isMobile && <NavDesk />}
      <div className="app-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<AllMoviesPage />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route path="/booking/:screeningId" element={<BookingPage />} />
          <Route
            path="/Bekräftelse/:bookingNumber" 
            element={<BookingConfirmation />}  />      
          <Route path="/kiosk" element={<KioskPage />} />
          <Route path="/AboutUs" element={<AboutUs />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/avboka/:token" element={<CancelBookingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>

        {isMobile && <BottomNavbar />}
      </div>
    </>
  );
}

export default App;