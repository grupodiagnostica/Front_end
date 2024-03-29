import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import "./NavBarComp.css";

import { AiOutlineProfile } from "react-icons/ai";
import { MdOutlineExitToApp } from "react-icons/md";
import { Avatar, Box, MenuGroup, MenuDivider } from "@chakra-ui/react";
import { loadLogout } from "../../store/ducks/tokens/actions.ts";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { DiagnosticaLogo } from "../Logo/DiagnosticaLogo";
import { MedicoClinicas } from "./MedicoClinicas";

export const NavbarComp = ({ customClass, showEntrarButton }) => {
  const location = useLocation();
  const { data: user } = useSelector((state) => state.tokens);
  let dis = false
  if (user.data.cnpj) {
    dis = true  
  }

  const navbarClassName = customClass
    ? `custom-navbar ${customClass}`
    : "custom-navbar";
  const history = useNavigate();
  const dispactch = useDispatch();

  function LoggoutAccount() {
    dispactch(loadLogout());
    history("/");
  }

  function PerfilPage() {
    history("/perfil");
  }

  function ClinicaPage() {
    history("/clinica")
  }

  return (
    <>
      <Navbar className={navbarClassName} expand="lg" data-bs-theme="dark">
        <Container>
          <Navbar.Brand as={Link} to={"/"}>
            <DiagnosticaLogo />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          {user.logged && <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="center-nav-links">
              <Nav.Link
                as={Link}
                to={"/diagnostico"}
                className={
                  location.pathname.includes("/diagnostico") ? "active" : ""
                }
                disabled={dis}
              >
                <div
                  className={
                    location.pathname.includes("/diagnostico") ? "active" : ""
                  }
                >
                  Diagnóstico
                </div>
              </Nav.Link>
              <Nav.Link
                as={Link}
                to={"/historico"}
                className={
                  location.pathname.includes("/historico") ? "active" : ""
                }
              >
                <div
                  className={
                    location.pathname.includes("/historico") ? "active" : ""
                  }
                >
                  Histórico
                </div>
              </Nav.Link>
              <Nav.Link
                as={Link}
                to={"/pacientes"}
                className={
                  location.pathname.includes("/pacientes") ? "active" : ""
                }
              >
                <div
                  className={
                    location.pathname.includes("/pacientes") ? "active" : ""
                  }
                >
                  Pacientes
                </div>
              </Nav.Link>

              <Nav.Link
                as={Link}
                to={"/sobre"}
                className={location.pathname.includes("/sobre") ? "active" : ""}
              >
                <div
                  className={
                    location.pathname.includes("/sobre") ? "active" : ""
                  }
                >
                  Sobre Nós
                </div>
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>}

          {user.logged ? (
            <Box
              display="flex"
              color="white"
              alignItems={"center"}
              verticalAlign="center"
            >
              
              <Menu>
                <MenuButton
                  as={Avatar}
                  aria-label="Options"
                  icon={ <Avatar name={user?.data?.pessoa?.nome} src={user?.data?.foto_perfil}/> }
                  variant="outline"
                  border="none"
                  colorScheme="white"
                  cursor={'pointer'}
                />
                <MenuList
                  colorScheme="white"
                  className="menulist"
                  background="white"
                  padding="0.5rem 0"
                  color="#0B2A45"
                >
                  <MenuItem
                    icon={<AiOutlineProfile />}
                    onClick={() => {
                      if (user.data.cnpj)
                      {
                        ClinicaPage();
                      }
                      else
                      {
                        PerfilPage();
                      }
                    }}
                  >
                    Perfil
                  </MenuItem>
                  
                  
                  {user.data.crm &&
                  <>
                  <MenuDivider />
                  <MenuGroup title="Clínicas" fontSize={'1.1rem'}>
                    <MedicoClinicas medico_id={user.data.id} />
                  </MenuGroup>
                  <MenuDivider />
                  </>
                  }

                  <MenuItem
                    icon={<MdOutlineExitToApp />}
                    onClick={() => {
                      LoggoutAccount();
                    }}
                  >
                    Sair
                  </MenuItem>
                </MenuList>
              </Menu>
            </Box>
          ) : showEntrarButton ? (
            <Button
              as={Link}
              to="/login"
              variant="light"
              className="entrar-button"
            >
              entrar
            </Button>
          ) : null}
        </Container>
      </Navbar>
    </>
  );
};
