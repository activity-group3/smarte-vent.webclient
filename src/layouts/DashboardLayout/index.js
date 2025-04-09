import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { FaSignOutAlt, FaUser, FaCalendar, FaCog, FaBars } from "react-icons/fa";
import "./dashboardLayout.css";

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/auth/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/auth/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="dashboard">
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        <FaBars />
      </button>
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <FaUser className="avatar" />
          <div className="user-info">
            <h3>{user?.name || "Student"}</h3>
            <p className="student-code">{user?.student_code || "Loading..."}</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          <Link
            to="/dashboard"
            className={location.pathname === "/dashboard" ? "active" : ""}
          >
            <FaCalendar /> All Activities
          </Link>
          <Link
            to="/my-activities"
            className={location.pathname === "/my-activities" ? "active" : ""}
          >
            <FaUser /> Joined Activity
          </Link>
          <Link
            to="/my-participation"
            className={location.pathname === "/my-participation" ? "active" : ""}
          >
            <FaUser /> My Participation
          </Link>
          <a href="#settings">
            <FaCog /> Settings
          </a>
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt /> Logout
          </button>
        </nav>
      </aside>
      <main className={`dashboard-content ${isSidebarOpen ? '' : 'expanded'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
