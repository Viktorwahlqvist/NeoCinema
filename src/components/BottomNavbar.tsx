
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext"; 
import "./Style/BottomNavBar.scss";

export default function BottomNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  // get state from AuthContext
  const { user, isLoading } = useAuth();

  // render account link based on auth state
  const renderAccountLink = () => {
    if (isLoading) {
      // still loading: show placeholder
      return (
        <span
          className="text-decoration-none text-center"
          style={{ opacity: 0.5, pointerEvents: "none" }}
        >
          <i className="bi bi-person neon-icon"></i>
          <div className="nav-label">...</div>
        </span>
      );
    }

    if (user) {
      // Logged in: show "Profile"
      return (
        <Link to="/profile" className="text-decoration-none text-center">
          <i className="bi bi-person neon-icon"></i>
          <div className="nav-label">Profil</div>
        </Link>
      );
    }

    // Not logged in: show "Login"
    return (
      <Link to="/login" className="text-decoration-none text-center">
        <i className="bi bi-person neon-icon"></i>
        <div className="nav-label">Logga in</div>
      </Link>
    );
  };

  return (
    <>
      <nav className="navbar fixed-bottom bottom-navbar-custom d-flex justify-content-around align-items-center">
        <Link to="/" className="text-decoration-none text-center">
          <i className="bi bi-house-door neon-icon"></i>
          <div className="nav-label">Hem</div>
        </Link>

        <Link to="/movies" className="text-decoration-none text-center">
          <i className="bi bi-film neon-icon"></i>
          <div className="nav-label">Filmer</div>
        </Link>

        {renderAccountLink()}

        <button
          className="btn btn-link text-decoration-none text-center p-0"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <i className="bi bi-list neon-icon"></i>
          <div className="nav-label">Meny</div>
        </button>
      </nav>

     
      <div className={`fullscreen-menu ${menuOpen ? "open" : ""}`}>
        <div className="menu-content">
          <button className="close-btn" onClick={() => setMenuOpen(false)}>
            <i className="bi bi-x-lg"></i>
          </button>
          <Link
            to="/AboutUs"
            onClick={() => setMenuOpen(false)}
            className="menu-item"
          >
            Om oss
          </Link>
          <Link
            to="/kiosk"
            onClick={() => setMenuOpen(false)}
            className="menu-item"
          >
            Kiosk
          </Link>
        </div>
      </div>
    </>
  );
}