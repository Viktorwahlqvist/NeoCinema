import { useState } from "react";
import { Link } from "react-router-dom";
import "./Style/BottomNavbar.scss";

export default function BottomNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="navbar fixed-bottom bottom-navbar-custom d-flex justify-content-around align-items-center">
        <Link to="/movies" className="text-decoration-none text-center">
          <i className="bi bi-film neon-icon"></i>
          <div className="nav-label">Filmer</div>
        </Link>

        <Link to="/" className="text-decoration-none text-center">
          <i className="bi bi-house-door neon-icon"></i>
          <div className="nav-label">Hem</div>
        </Link>

        <Link to="/profile" className="text-decoration-none text-center">
          <i className="bi bi-person neon-icon"></i>
          <div className="nav-label">Profil</div>
        </Link>

        <button
          className="btn btn-link text-decoration-none text-center p-0"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <i className="bi bi-list neon-icon"></i>
          <div className="nav-label">Meny</div>
        </button>
      </nav>

      {/* Fullbredd glidande meny */}
      <div className={`fullscreen-menu ${menuOpen ? "open" : ""}`}>
        <div className="menu-content">
          <button className="close-btn" onClick={() => setMenuOpen(false)}>
            <i className="bi bi-x-lg"></i>
          </button>
          <Link to="/about" className="menu-item">Om oss</Link>
          <Link to="/kiosk" className="menu-item">Kiosk</Link>
        </div>
      </div>
    </>
  );
}
