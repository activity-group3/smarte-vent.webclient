"use client";

import { useEffect, useState } from "react";
import {
  FaCalendar,
  FaUsers,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUser,
  FaBuilding,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { User, SidebarProps } from '@/types/auth';

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path: string;
}

export function Sidebar({ Uprising, onLogout }: SidebarProps) {
  const location = useLocation();
  const pathname = location.pathname;

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  const navItems: NavItem[] = [
    { name: "Dashboard", icon: <FaBuilding />, path: "/" },
      { name: "Activities", icon: <FaCalendar />, path: "/activities" },
    { name: "Users", icon: <FaUsers />, path: "/users" },
    { name: "Analytics", icon: <FaChartBar />, path: "/analytics" },
    { name: "Settings", icon: <FaCog />, path: "/settings" },
  ];

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
        setUser(null);
      }
    }
  }, []);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  return (
    <>
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 p-2 rounded-md shadow-md"
        >
          {isMobileOpen ? <FaTimes /> : <FaBars />}
        </button>

        {isMobileOpen && (
          <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleMobileSidebar}></div>
        )}

      <aside
        className={`${isMobileOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 fixed md:relative z-50 h-screen transition-all duration-300 ease-in-out ${isCollapsed ? "w-20" : "w-64"
          } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-md`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                A
              </div>
              {!isCollapsed && <span className="ml-3 font-bold text-gray-800 dark:text-white">Admin Portal</span>}
            </div>
            <button
              onClick={toggleSidebar}
              className="hidden md:block text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            >
              {isCollapsed ? <FaBars className="w-5 h-5" /> : <FaTimes className="w-5 h-5" />}
            </button>
          </div>

          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                <FaUser className="text-gray-500 dark:text-gray-400" />
              </div>
              {!isCollapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-white">{user?.name || "Admin User"}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || "admin@example.com"}</p>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-2 px-3">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-lg transition-colors ${pathname === item.path
                      ? "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {!isCollapsed && <span className="ml-3 text-sm font-medium">{item.name}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onLogout}
              className="flex items-center w-full p-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FaSignOutAlt className="text-xl" />
              {!isCollapsed && <span className="ml-3">Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
} 
