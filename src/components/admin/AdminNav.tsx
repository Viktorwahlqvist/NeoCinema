import React from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import "./Admin-nav.scss";
import { Link } from 'react-router-dom';

export default function AdminNav() {
  return (
    <Navbar bg="dark" data-bs-theme="dark" expand="md" className="m-0 z-10">
      <Container className="m-0">
        <Link to="/">
          <img className="admin-logo me-3" src="/NeoCinema.png" alt="NeoCinema" />
        </Link>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="ms-3 gap-3">
            <Link className="nav-link" to="bookings">Bokningar</Link>
            <Link className="nav-link" to="users">Användare</Link>
            <Link className="nav-link" to="/profile">Tillbaka till profil</Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
