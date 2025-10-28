import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { Film, CupHot, InfoCircle, House, Person } from "react-bootstrap-icons";
import "./Style/NavDesk.scss";
// import logga from "/NeoCinema.png";

export default function NavDesk() {
  return (
    <Navbar className="neo-navbar" sticky="top">
      <Container fluid className="neo-shell">
        {/* Vänster: logga → hem */}
        <div className="neo-logo">
          <NavLink to="/" className="neo-logo-link">
            <img src="/NeoCinema.png" alt="NeoCinema" className="neo-logo-img" />
          </NavLink>
        </div>

        {/* Mitten: meny */}
        <Nav className="neo-menu">

             <NavLink to="/" end className="neo-link">
            <House className="neo-icon" />
            {/* Hem */}
            <span className="neo-text">Hem</span>
          </NavLink>
          <NavLink to="/Movies" className="neo-link">
            <Film className="neo-icon" />
            {/* Filmer */}
            <span className="neo-text">Filmer</span>
          </NavLink>
          <NavLink to="/kiosk" className="neo-link">
            <CupHot className="neo-icon" />
            {/* Kiosk */}
            <span className="neo-text">Kiosk</span>
          </NavLink>
          <NavLink to="/AboutUs" className="neo-link">
            <InfoCircle className="neo-icon" />
            {/* Om Oss */}
            <span className="neo-text">Om oss</span>
          </NavLink>
        </Nav>

        {/* Konto */}
        <div className="neo-account">
          <NavLink to="/konto" className="neo-link">
            <Person className="neo-icon" />
            <span className="neo-text">Konto</span>
          </NavLink>
        </div>
      </Container>
    </Navbar>
  );
};

