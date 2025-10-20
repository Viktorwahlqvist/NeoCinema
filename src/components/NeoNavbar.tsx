import React from "react"
import {Navbar, nav, Cointainer } from "react-bootstrap"
import { Navlink } from "react-router-dom"

import Logo from "assets/Logga.jpg"

type LinkState = { isActive: boolean; isPending: boolean; isTransitioning?: boolean };

const NeoNavbar: React.FC = () => {
  return (
    <Navbar expand="lg" sticky="top" className="neo-navbar">
      <Container className="justify-content-between">
        

      </Container>
    </Navbar>
  )
}