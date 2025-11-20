import React from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import "./Admin-nav.scss";
import { Link } from 'react-router-dom';

export default function AdminNav() {
  return (
    <Navbar bg="dark" data-bs-theme="dark" className='m-0'>
      <Container className='m-0'>
        <Link to="dashboard"><img className='admin-logo me-5' src="/NeoCinema.png" alt="NeoCinema" /></Link>
        <Nav className="me-auto  gap-4">
          <Link to="dashboard">Dashboard</Link>
          <Link to="bookings">Bokningar</Link>
          <Link to="users">Användare</Link>
        </Nav>
      </Container>
    </Navbar>
  );
}
