import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "./NeoNavbar.scss";

import { Film, CupHot, InfoCircle, House, Person } from "react-bootstrap-icons";
const logga = "/NeoCinema.png";



const NeoNavbar: React.FC = () => {
  return (
    <Navbar sticky="top" className="neo-navbar">
      <Container fluid className="neo-shell d-flex align-items-center">

        {/* Logga med länk till startsida (länk saknas) */}
        <div className="neo-logo">
          <NavLink to="/" className="neo-logo-link d-flex align-items-center gap-2">
            <img src={logga} alt="NeoCinema logotyp" className="neo-logo-img" />
          </NavLink>
        </div>

        {/* inte länkat rätt än, Filmer */}
        <Nav className="neo-menu d-flex align-items-center justify-content-center gap-5 mx-auto">
          <NavLink to="/filmer" className="neo-link text-center d-flex flex-column align-items-center">
            <Film className="neo-icon" />
            <span className="neo-text">Filmer</span>
          </NavLink>
          
          {/* inte länkat rätt än, Kiosk */}
          <NavLink to="/kiosk" className="neo-link text-center d-flex flex-column align-items-center">
            <CupHot className="neo-icon" />
            <span className="neo-text">Kiosk</span>
          </NavLink>
          
          {/* inte länkat rätt än, Om oss */}
          <NavLink to="/om-oss" className="neo-link text-center d-flex flex-column align-items-center">
            <InfoCircle className="neo-icon" />
            <span className="neo-text">Om oss</span>
          </NavLink>

          {/* inte länkat rätt än, Hem */}
          <NavLink to="/" end className="neo-link text-center d-flex flex-column align-items-center">
            <House className="neo-icon" />
            <span className="neo-text">Hem</span>
          </NavLink>
        </Nav>

        {/*  Profil sida  */}
        <div className="neo-account">
          <NavLink to="/konto" className="neo-link text-center d-flex flex-column align-items-center">
            <Person className="neo-icon" />
            <span className="neo-text">Konto</span>
          </NavLink>
        </div>

      </Container>
    </Navbar>
  );
};

export default NeoNavbar;