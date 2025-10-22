import { useState } from "react";
import "./BottomNavbar.scss";

export default function BottomNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bottom-navbar">
      <div className="filmerBtn">
      <a href="#" className="nav-btn">
        <i className="bi bi-film"></i>
        <span>Filmer</span>
      </a>
      </div>

      <a href="#"  className="nav-btn">
        <i className="bi bi-house-door"></i>
        <span>Hem</span>
      </a>

      <a href="#" className="nav-btn">
        <i className="bi bi-person"></i>
        <span>Profil</span>
      </a>

      <button
        className="nav-btn"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <i className="bi bi-list"></i>
        <span>Meny</span>
      </button>

      {/* Glidande meny */}
      <div className={`slide-menu ${menuOpen ? "open" : ""}`}>
        <button className="slide-item">Om oss</button>
        <button className="slide-item">Kiosk</button>
      </div>
    </nav>
  );
}
