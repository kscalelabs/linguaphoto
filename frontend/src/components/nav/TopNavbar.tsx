import { useTheme } from "hooks/theme";
import { useState } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { GearFill, MoonFill, SunFill } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";

const TopNavbar = () => {
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const { theme, setTheme } = useTheme();

  return (
    <>
      <Navbar
        className="fixed w-full top-0 z-50 bg-gray-100 dark:bg-gray-800 justify-content-between"
        expand="lg"
      >
        <Container>
          <Navbar.Brand as={Link} to="/">
            LinguaPhoto
          </Navbar.Brand>

          <div className="d-flex gap-3">
            <Nav.Link
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <MoonFill /> : <SunFill />}
            </Nav.Link>
            <Nav.Link onClick={() => setShowSidebar(true)}>
              <GearFill />
            </Nav.Link>
          </div>
        </Container>
      </Navbar>
      <Sidebar show={showSidebar} onClose={() => setShowSidebar(false)} />
    </>
  );
};

export default TopNavbar;
