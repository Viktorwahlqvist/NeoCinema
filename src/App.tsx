import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
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
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminPage from "./pages/AdminPage";
import AdminBookings from "./pages/AdminBookings";

function App() {
  const location = useLocation();
  const isMobile = useIsMobile();

  const isAdminPage = location.pathname.startsWith("/admin");
  return (
    <>
      <CookieModal />
      {!isMobile && !isAdminPage && <NavDesk />}
      <div className="app-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<AllMoviesPage />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route path="/booking/:screeningId" element={<BookingPage />} />
          <Route
            path="/Bekräftelse/:bookingNumber"
            element={<BookingConfirmation />} />
          <Route path="/kiosk" element={<KioskPage />} />
          <Route path="/AboutUs" element={<AboutUs />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/avboka/:token" element={<CancelBookingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={
            <AdminProtectedRoute>
              <AdminPage />
            </AdminProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<p>All info</p>} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="users" element={<p>All users</p>} />
          </Route>
        </Routes>
        {isMobile && !isAdminPage && <BottomNavbar />}

      </div>
    </>
  );
}

export default App;