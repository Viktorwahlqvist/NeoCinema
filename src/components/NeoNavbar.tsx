import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "./NeoNavbar.scss";

import { Film, CupHot, InfoCircle, House } from "react-bootstrap-icons";
import logga from "../assets/Logga.png";

const NeoNavbar: React.FC = () => {
  return (
    // Logga med länk till startsida (länk saknas)
    <Navbar sticky="top" className="neo-navbar py-3">
      <Container className="d-flex justify-content-between align-items-center">
        <div className="neo-logo">
          <NavLink to="/" className="neo-logo-link d-flex align-items-center gap-2">
            <img 
              src={logga} 
              alt="NeoCinema logotyp" 
              className="neo-logo-img" 
            />
          </NavLink>
        </div>

        <Nav className="neo-menu d-flex align-items-center justify-content-center gap-5">

          {/* inte länkat rätt än */}
          <NavLink to="/filmer" className="neo-link text-center d-flex flex-column align-items-center">
            <Film className="neo-icon" />
            <span className="neo-text">Filmer</span>
          </NavLink>

          {/* inte länkat rätt än */}
          <NavLink to="/kiosk" className="neo-link text-center d-flex flex-column align-items-center">
            <CupHot className="neo-icon" />
            <span className="neo-text">Kiosk</span>
          </NavLink>

          {/* inte länkat rätt än */}
          <NavLink to="/om-oss" className="neo-link text-center d-flex flex-column align-items-center">
            <InfoCircle className="neo-icon" />
            <span className="neo-text">Om oss</span>
          </NavLink>

          {/* inte länkat rätt än */}
          <NavLink to="/" end className="neo-link text-center d-flex flex-column align-items-center">
            <House className="neo-icon" />
            <span className="neo-text">Hem</span>
          </NavLink>

        </Nav>
      </Container>
    </Navbar>
  );
};

export default NeoNavbar;