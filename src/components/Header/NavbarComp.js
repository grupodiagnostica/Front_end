import React from 'react'
import {Navbar, Nav, Container, Button} from 'react-bootstrap'
import {Link} from 'react-router-dom'
import logo from '../../assets/noto_lungs.png'
import './NavBarComp.css'

export const NavbarComp=() => {
  return (

   <>
      <Navbar className="custom-navbar" expand="lg" data-bs-theme="dark">
        <Container>
          <Navbar.Brand as={Link} to={ "/"}>
            <img src={logo} alt="HermesIA Logo" /><span className="brand-text">HermesIA</span></Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="center-nav-links">
              <Nav.Link as={Link} to={ "/sobre"}>Sobre Nós</Nav.Link>
              <Nav.Link as={Link} to={ "/diagnostico"}>Diagnóstico</Nav.Link>
              <Nav.Link as={Link} to={ "/historico"}>Histórico</Nav.Link>
              <Nav.Link as={Link} to={ "/pacientes"}>Pacientes</Nav.Link>
            </Nav>
          </Navbar.Collapse>
          <Button as={Link} to="/cadastro" variant="light" className="entrar-button">entrar</Button>
        </Container>
      </Navbar>
   </>
   
  )
}