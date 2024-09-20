import clsx from "clsx";
import { useAuth } from "contexts/AuthContext";
import {
  FaHome,
  FaLock,
  FaSignInAlt,
  FaSignOutAlt,
  FaThList,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface SidebarItemProps {
  title: string;
  icon?: JSX.Element;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  align?: "left" | "right";
}

const SidebarItem = ({
  icon,
  title,
  onClick,
  size = "md",
  align = "left",
}: SidebarItemProps) => {
  return (
    <li>
      <button onClick={onClick} className="w-full focus:outline-none">
        <span className="flex items-center py-2 px-4 text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group">
          {align === "right" ? (
            <>
              <span className="flex-grow" />
              <span
                className={clsx(
                  icon && "mr-4",
                  size === "sm" && "text-sm",
                  size === "lg" && "text-lg",
                )}
              >
                {title}
              </span>
              {icon}
            </>
          ) : (
            <>
              {icon}
              <span
                className={clsx(
                  icon && "ml-4",
                  size === "sm" && "text-sm",
                  size === "lg" && "text-lg",
                )}
              >
                {title}
              </span>
            </>
          )}
        </span>
      </button>
    </li>
  );
};

interface SidebarProps {
  show: boolean;
  onClose: () => void;
}

const Sidebar = ({ show, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const { auth, signout } = useAuth();
  return (
    <div>
      {show ? (
        <div
          className="fixed top-0 right-0 z-50 w-full sm:w-64 h-screen p-4 overflow-y-auto transition-transform bg-gray-100 dark:bg-gray-800"
          tabIndex={-1}
        >
          <div className="flex justify-between items-center">
            <h5
              id="drawer-navigation-label"
              className="text-base font-semibold text-gray-500 uppercase dark:text-gray-300"
            >
              MENU
            </h5>

            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <FaTimes />
              <span className="sr-only">Close menu</span>
            </button>
          </div>
          <div className="py-4 overflow-y-auto">
            <ul className="space-y-1">
              <SidebarItem
                title="Home"
                icon={<FaHome />}
                onClick={() => {
                  navigate("/");
                  onClose();
                }}
                size="md"
              />
              {auth?.is_auth ? (
                <SidebarItem
                  title="Collections"
                  icon={<FaThList />}
                  onClick={() => {
                    navigate("/collections");
                    onClose();
                  }}
                  size="md"
                />
              ) : (
                <></>
              )}
              <SidebarItem
                title="Subscription"
                icon={<FaLock />}
                onClick={() => {
                  navigate("/subscription");
                  onClose();
                }}
                size="md"
              />
            </ul>

            {/* Divider */}
            <hr className="my-4 border-gray-300 dark:border-gray-600" />

            <ul className="space-y-1">
              {auth?.is_auth ? (
                <SidebarItem
                  title="Logout"
                  icon={<FaSignOutAlt />}
                  onClick={() => {
                    // Handle logout logic here
                    signout();
                    navigate("/login");
                    onClose();
                  }}
                  size="md"
                />
              ) : (
                <SidebarItem
                  title="Login / Sign Up"
                  icon={<FaSignInAlt />}
                  onClick={() => {
                    navigate("/login");
                    onClose();
                  }}
                  size="md"
                />
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Sidebar;
