import "../componentcss/Navbar.css";

import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";


export default function MyNavbar() {
  return (
    <>
      {/* Desktop: vertikal vänstermeny */}
      <aside className="sidebar custom-navbar d-none d-lg-flex flex-column">
        <div className="p-3 fs-5 fw-semibold">Hem</div>
        <Nav className="flex-column px-3">
          <Nav.Link href="#home">Sök</Nav.Link>
          <Nav.Link href="#movies">Filmer</Nav.Link>
          <Nav.Link href="#account">Konto</Nav.Link>
        </Nav>
      </aside>

      {/* Mobil: fixed-bottom navbar */}
      <Navbar fixed="bottom" className="bottom-nav custom-navbar d-lg-none">
        <Container fluid className="px-0">
          <Nav className="w-100 justify-content-around">
            <Nav.Link href="#home">Hem</Nav.Link>
            <Nav.Link href="#home">Sök</Nav.Link>
            <Nav.Link href="#movies">Filmer</Nav.Link>
            <Nav.Link href="#account">Konto</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
    </>
  );
}