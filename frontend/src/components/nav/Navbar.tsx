import { useState } from "react";
import { FaBars } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

import Container from "components/HOC/Container";
import Logo from "components/Logo";
import Sidebar from "components/nav/Sidebar";
import { useAuth } from "contexts/AuthContext";
const Navbar = () => {
  const { auth, signout } = useAuth();
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const location = useLocation();

  const navItems = [
    { name: "My Collections", path: "/collections", isExternal: false },
    { name: "Subscription", path: "/subscription", isExternal: false },
    { name: "API key", path: "/api-key", isExternal: false },
  ];

  return (
    <>
      {
        <nav className="fixed w-full z-30 top-0 start-0 bg-gray-1/30 backdrop-blur-lg">
          <Container>
            <div className="flex items-center justify-between py-2 font-medium">
              <Link
                to="/"
                className="flex items-center space-x-2 bg-gray-12 p-3 rounded-lg hover:bg-primary-9 transition-all duration-300"
              >
                <Logo />
              </Link>
              <div className="hidden lg:flex items-center flex-grow justify-between ml-4">
                <div className="flex space-x-3 bg-gray-12 rounded-lg p-2 flex-grow justify-center">
                  {navItems.map((item) =>
                    item.isExternal ? (
                      <a
                        key={item.name}
                        href={item.path}
                        className={`px-2 xl:px-3 py-2 rounded-md text-sm tracking-wide xl:tracking-widest text-gray-1 hover:bg-primary-9`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.name}
                      </a>
                    ) : (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`px-2 xl:px-3 py-2 rounded-md text-sm tracking-widest ${
                          location.pathname === item.path
                            ? "bg-gray-11 text-gray-1"
                            : "text-gray-1 hover:bg-gray-1 hover:text-primary-9"
                        }`}
                      >
                        {item.name}
                      </Link>
                    ),
                  )}
                </div>
                <div className="flex items-center space-x-2 text-gray-1 bg-gray-12 rounded-lg p-2 ml-4 text-sm tracking-widest">
                  {auth?.is_auth ? (
                    <>
                      {/* <Link
                    to="/account"
                    className={`px-3 py-2 rounded-md hover:bg-gray-1 hover:text-primary-9 ${location.pathname === "/account"
                      ? "bg-gray-11 text-gray-1"
                      : ""
                      }`}
                  >
                    Account
                  </Link> */}
                      <Link
                        to="/login"
                        className="px-3 py-2 rounded-md hover:bg-primary-9"
                        onClick={signout}
                      >
                        Logout
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="px-3 py-2 rounded-md hover:bg-gray-1 hover:text-primary-9"
                      >
                        Sign In
                      </Link>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowSidebar(true)}
                className="lg:hidden text-gray-300 hover:bg-gray-700 bg-gray-12 hover:text-white p-4 rounded-md text-sm"
              >
                <FaBars size={20} />
              </button>
            </div>
          </Container>
        </nav>
      }
      <Sidebar show={showSidebar} onClose={() => setShowSidebar(false)} />
    </>
  );
};

export default Navbar;
