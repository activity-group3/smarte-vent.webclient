import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet, NavLink } from "react-router-dom";
import {
  FaSignOutAlt,
  FaSun,
  FaMoon,
  FaCalendar,
  FaUser,
  FaCog,
  FaPlus,
  FaTachometerAlt,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaBell,
  FaChartBar,
  FaClipboardCheck,
  FaCertificate,
  FaBook,
  FaGraduationCap,
  FaHistory,
  FaStar,
  FaUserCog,
} from "react-icons/fa";
import AccountManagementModal from "../../components/AccountManagementModal";
import "./dashboardLayout.css";
import NotificationDropdown from "../../components/NotificationDropdown";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "ORGANIZATION" | "STUDENT";
}

interface NavigationItem {
  path: string;
  icon: React.ReactNode;
  label: string;
  exact: boolean;
}

const StudentLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState<boolean>(false);
  const [accountModalOpen, setAccountModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/auth/login");
      return;
    }
    const user: User = JSON.parse(userData);
    if (user.role !== "STUDENT") {
      navigate("/dashboard");
      return;
    }
    setUser(user);

    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme as "light" | "dark");
    }
  }, [navigate]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  const handleLogout = (): void => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/auth/login");
  };

  const toggleMobileSidebar = (): void => setIsMobileOpen(!isMobileOpen);
  const toggleProfileMenu = (): void => setProfileMenuOpen(!profileMenuOpen);
  const toggleTheme = (): void => setTheme(theme === "light" ? "dark" : "light");

  const navigationItems: NavigationItem[] = [
    {
      path: "/dashboard",
      icon: <FaTachometerAlt />,
      label: "Dashboard",
      exact: true
    },
    {
      path: "/my-participation",
      icon: <FaClipboardCheck />,
      label: "My Participation",
      exact: false
    },
    {
      path: "/my-activities/contributor",
      icon: <FaUser />,
      label: "My Contributions",
      exact: false
    },
    {
      path: "/my-analysis",
      icon: <FaChartBar />,
      label: "My Analysis",
      exact: false
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileSidebar}
        className="md:hidden fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 p-2 rounded-md shadow-md"
      >
        {isMobileOpen ? <FaTimes /> : <FaBars />}
      </button>

      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Top Header - Transparent with only bell and user */}
      <div className="fixed top-0 right-0 z-50 h-16 flex items-center justify-end pr-4">
        <div className="flex items-center space-x-4">
          {/* Notification Dropdown */}
          <div className="relative">
            <NotificationDropdown />
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={toggleProfileMenu}
              className="flex items-center text-white hover:text-gray-200 focus:outline-none"
            >
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                {user?.name?.charAt(0) || "S"}
              </div>
              <span className="ml-2 font-medium hidden lg:block">
                {user?.name || "User"}
              </span>
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
                <button
                  onClick={() => {
                    setAccountModalOpen(true);
                    setProfileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FaUserCog className="w-4 h-4 mr-2" />
                  <span>Account Settings</span>
                </button>
                <button
                  onClick={toggleTheme}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {theme === "light" ? <FaMoon className="w-4 h-4 mr-2" /> : <FaSun className="w-4 h-4 mr-2" />}
                  <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <FaSignOutAlt className="mr-2" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 fixed md:relative z-50 transition-all duration-300
        w-64 h-screen bg-white dark:bg-slate-800 shadow-lg flex-none`}
      >
        <div className="flex flex-col h-full">
          {/* Profile Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h2
                className="text-xl font-bold text-gray-800 dark:text-white"
              >
                Student Portal
              </h2>
              <p
                className="text-sm text-gray-600 dark:text-gray-300 mt-1"
              >
                {user?.name || "Student"}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                return (
                  <li key={item.path} className="px-2">
                    <NavLink
                      to={item.path}
                      end={item.exact}
                      className={({ isActive: isNavActive }) =>
                        `nav-link flex items-center rounded-lg transition-all duration-200 px-4 py-3 ${isNavActive
                          ? "nav-item-active bg-blue-500 text-white shadow-md"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                        }`
                      }
                      onClick={() => {
                        if (isMobileOpen) {
                          toggleMobileSidebar();
                        }
                      }}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="nav-text ml-3 font-medium">{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col items-center justify-between space-y-2">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <FaSignOutAlt className="w-5 h-5" />
                <span className="ml-5">Logout</span>
              </button>
              <button
                onClick={toggleTheme}
                className="flex items-center w-full px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                {theme === "light" ? (
                  <FaMoon className="w-5 h-5" />
                ) : (
                  <FaSun className="w-5 h-5" />
                )}
                <span className="ml-5">
                  {theme === "light" ? "Dark Mode" : "Light Mode"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className="flex-1 h-screen pt-16 md:pt-0 overflow-y-auto overflow-x-hidden"
      >
        <div className="p-6 w-full max-w-full">
          <div className="w-full max-w-full break-words">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Account Management Modal */}
      <AccountManagementModal
        open={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
      />
    </div>
  );
};

export default StudentLayout; 
