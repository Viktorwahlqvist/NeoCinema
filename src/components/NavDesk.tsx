import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { Film, CupHot, InfoCircle, House, Person } from "react-bootstrap-icons";
import "./Style/NavDesk.scss";
import { useAuth } from "../AuthContext";

export default function NavDesk() {

  const { user, isLoading } = useAuth();
  const renderAccountLink = () => {
    // show nothing while loading
    if (isLoading) {
      return null;
    }
    if (user) {
      return (
        <NavLink to="/profile" className="neo-link">
          {" "}

          <Person className="neo-icon" />
          <span className="neo-text">Konto</span>
        </NavLink>
      );
    }

    // User is NOT logged in
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

        <div className="neo-logo">
          <NavLink to="/" className="neo-logo-link">
            <img
              src="/NeoCinema.png"
              alt="NeoCinema"
              className="neo-logo-img"
            />
          </NavLink>
        </div>


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

        {/* Dynamic account link */}
        <div className="neo-account">{renderAccountLink()}</div>
      </Container>
    </Navbar>
  );
}