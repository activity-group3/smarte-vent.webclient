import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { FaSignOutAlt, FaUsers, FaCalendar, FaCog, FaBars, FaTachometerAlt } from "react-icons/fa";
// import "./adminLayout.css";

const AdminLayout = () => {
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

    const user = JSON.parse(userData);
    // Check if user has ADMIN role, if not redirect to dashboard
    if (user.role !== "ADMIN") {
      navigate("/dashboard");
      return;
    }
    setUser(user);
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
          <h2>Admin Panel</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin/dashboard" className={location.pathname === "/admin/dashboard" ? "active" : ""}>
            <FaTachometerAlt /> Dashboard
          </Link>
          <Link to="/admin/users" className={location.pathname === "/admin/users" ? "active" : ""}>
            <FaUsers /> Users
          </Link>
          <Link to="/admin/activities" className={location.pathname === "/admin/activities" ? "active" : ""}>
            <FaCalendar /> Activities
          </Link>
          <Link to="/admin/settings" className={location.pathname === "/admin/settings" ? "active" : ""}>
            <FaCog /> Settings
          </Link>
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

export default AdminLayout;
