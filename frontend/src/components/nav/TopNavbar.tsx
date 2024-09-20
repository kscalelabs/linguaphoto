import { useAuth } from "contexts/AuthContext";
import { useTheme } from "hooks/theme";
import { useState } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { MoonFill, SunFill } from "react-bootstrap-icons";
import {
  FaBars,
  FaLock,
  FaSignInAlt,
  FaSignOutAlt,
  FaThList,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

const TopNavbar = () => {
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const { theme, setTheme } = useTheme();
  const location = useLocation(); // To determine the active link
  const { auth, signout } = useAuth();
  return (
    <>
      <Navbar
        className="fixed w-full top-0 z-50 bg-gray-100 dark:bg-gray-800 justify-content-between shadow-lg"
        expand="lg"
        style={{ height: "60px" }} // Set navbar height
      >
        <Container className="flex justify-between items-center h-full">
          <Navbar.Brand
            as={Link}
            to="/"
            className="text-xl text-gray-900 dark:text-white" // Reduced font size
          >
            LinguaPhoto
          </Navbar.Brand>

          <div className="flex gap-6 items-center">
            {/* Main Navigation Links */}
            <div className="hidden sm:flex gap-6">
              {" "}
              {/* Hidden on small screens */}
              {auth?.is_auth ? (
                <>
                  <Nav.Link
                    as={Link}
                    to="/collections"
                    className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-md ${
                      location.pathname === "/collections"
                        ? "text-blue-600 dark:text-blue-400 font-semibold"
                        : "text-gray-800 dark:text-gray-300"
                    } hover:text-blue-500 dark:hover:text-blue-300`}
                  >
                    <FaThList /> <span>Collections</span>
                  </Nav.Link>

                  <Nav.Link
                    as={Link}
                    to="/subscription"
                    className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-md ${
                      location.pathname === "/subscription"
                        ? "text-blue-600 dark:text-blue-400 font-semibold"
                        : "text-gray-800 dark:text-gray-300"
                    } hover:text-blue-500 dark:hover:text-blue-300`}
                  >
                    <FaLock /> <span>Subscription</span>
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/login"
                    className="flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-md hover:text-blue-500 dark:hover:text-blue-300"
                    onClick={() => {
                      // Handle logout logic here
                      signout();
                    }}
                  >
                    <FaSignOutAlt /> <span>Logout</span>
                  </Nav.Link>
                </>
              ) : (
                <Nav.Link
                  as={Link}
                  to="/login"
                  className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-md ${
                    location.pathname === "/login"
                      ? "text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-gray-800 dark:text-gray-300"
                  } hover:text-blue-500 dark:hover:text-blue-300`}
                  onClick={() => {
                    // Handle logout logic here
                    signout();
                  }}
                >
                  <FaSignInAlt /> <span>Login / Sign Up</span>
                </Nav.Link>
              )}
            </div>

            {/* Theme Toggle and Sidebar */}
            <div className="flex items-center gap-3">
              <Nav.Link
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center text-lg text-gray-800 dark:text-gray-300"
              >
                {theme === "dark" ? <SunFill /> : <MoonFill />}
              </Nav.Link>

              <Nav.Link
                onClick={() => setShowSidebar(true)}
                className="flex items-center text-lg text-gray-800 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-300 lg:hidden" // Show only on small screens
              >
                <FaBars /> {/* Hamburger Button */}
              </Nav.Link>
            </div>
          </div>
        </Container>
      </Navbar>

      <Sidebar show={showSidebar} onClose={() => setShowSidebar(false)} />
    </>
  );
};

export default TopNavbar;
