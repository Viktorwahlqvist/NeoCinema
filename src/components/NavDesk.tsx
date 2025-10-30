// src/components/NavDesk.tsx
import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { Film, CupHot, InfoCircle, House, Person } from "react-bootstrap-icons";
import "./Style/NavDesk.scss";
import { useAuth } from "../AuthContext"; // <-- 1. Importera hooken

export default function NavDesk() {
  // 2. Hämta state från din globala context
  const { user, isLoading } = useAuth();

  // 3. Bygg upp konto-länken baserat på state
  const renderAccountLink = () => {
    // Visa inget alls medan vi kollar (förhindrar "flash")
    if (isLoading) {
      return null;
    }

    // Användaren ÄR inloggad
    if (user) {
      return (
        <NavLink to="/profile" className="neo-link">
          {" "}
          {/* <-- Länka till profil */}
          <Person className="neo-icon" />
          <span className="neo-text">Konto</span> {/* <-- Ändrad text */}
        </NavLink>
      );
    }

    // Användaren är INTE inloggad
    return (
      <NavLink to="/login" className="neo-link">
        <Person className="neo-icon" />
        <span className="neo-text">Logga in</span>
      </NavLink>
    );
  };

  return (
    <Navbar className="neo-navbar" sticky="top">
      <Container fluid className="neo-shell">
        {/* Vänster: logga → hem */}
        <div className="neo-logo">
          <NavLink to="/" className="neo-logo-link">
            <img
              src="/NeoCinema.png"
              alt="NeoCinema"
              className="neo-logo-img"
            />
          </NavLink>
        </div>

        {/* Mitten: meny */}
        <Nav className="neo-menu">
          <NavLink to="/" end className="neo-link">
            <House className="neo-icon" />
            <span className="neo-text">Hem</span>
          </NavLink>
          <NavLink to="/Movies" className="neo-link">
            <Film className="neo-icon" />
            <span className="neo-text">Filmer</span>
          </NavLink>
          <NavLink to="/kiosk" className="neo-link">
            <CupHot className="neo-icon" />
            <span className="neo-text">Kiosk</span>
          </NavLink>
          <NavLink to="/AboutUs" className="neo-link">
            <InfoCircle className="neo-icon" />
            <span className="neo-text">Om oss</span>
          </NavLink>
        </Nav>

        {/* 4. Använd din nya dynamiska länk */}
        <div className="neo-account">{renderAccountLink()}</div>
      </Container>
    </Navbar>
  );
}