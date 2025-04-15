import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaUsers,
  FaCalendarCheck,
  FaChartBar,
  FaSignOutAlt,
  FaCalendarTimes,
  FaClock,
  FaMapMarkerAlt,
} from "react-icons/fa";
import "./adminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalActivities: 0,
    activeActivities: 0,
    totalParticipants: 0,
    completedActivities: 0,
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 6,
  });

  const [sort, setSort] = useState({
    field: "startDate",
    direction: "desc",
  });

  const pageSizeOptions = [5, 10, 15, 20];

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/auth/login");
      return;
    }
    setUser(JSON.parse(userData));
    fetchDashboardStats();
    fetchActivities(pagination.currentPage);
  }, [navigate, pagination.currentPage, pagination.pageSize, sort]);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8080/admin/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.status_code === 200) {
        setStats(data.data);
      } else {
        setError("Failed to fetch dashboard statistics");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  const fetchActivities = async (page) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8080/activities?page=${page}&size=${pagination.pageSize}&sort=${sort.field},${sort.direction}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.status_code === 200) {
        const transformedActivities = data.data.results.map((activity) => ({
          id: activity.id,
          activityName: activity.activity_name,
          description: activity.description,
          startDate: activity.start_date,
          endDate: activity.end_date,
          activityVenue: activity.activity_venue,
          activityStatus: activity.activity_status,
          activityCategory: activity.activity_category,
          capacity: activity.capacity,
          capacity_limit: activity.capacity_limit,
        }));
        setActivities(transformedActivities);
        setPagination((prev) => ({
          ...prev,
          totalPages: data.data.total_pages,
        }));
      } else {
        setError("Failed to fetch activities");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/auth/login");
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: newPage,
    }));
  };

  const handleSortChange = (event) => {
    const [field, direction] = event.target.value.split(",");
    setSort({ field, direction });
  };

  const handlePageSizeChange = (event) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: Number(event.target.value),
      currentPage: 1,
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "WAITING_TO_START":
        return "status-waiting";
      case "IN_PROGRESS":
        return "status-progress";
      case "COMPLETED":
        return "status-completed";
      case "CANCELLED":
        return "status-cancelled";
      default:
        return "status-default";
    }
  };

  const getCategoryStyle = (category) => {
    switch (category) {
      case "THIRD_PARTY":
        return "category-third-party";
      case "UNIVERSITY":
        return "category-university";
      case "DEPARTMENT":
        return "category-department";
      case "STUDENT_ORGANIZATION":
        return "category-student-org";
      default:
        return "category-default";
    }
  };

  const handleActivityClick = (id) => {
    navigate(`/admin/activities/${id}`);
  };

  return (
    <main className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="header-actions">
          <p>Welcome back, {user?.name}</p>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
          <button
            className="create-activity-btn"
            onClick={() => navigate("/admin/activities/create")}
          >
            <FaPlus /> Create New Activity
          </button>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaCalendarCheck />
          </div>
          <div className="stat-info">
            <h3>Total Activities</h3>
            <p className="stat-number">{loading ? "..." : stats.totalActivities}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaChartBar />
          </div>
          <div className="stat-info">
            <h3>Active Activities</h3>
            <p className="stat-number">{loading ? "..." : stats.activeActivities}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-info">
            <h3>Total Participants</h3>
            <p className="stat-number">{loading ? "..." : stats.totalParticipants}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaCalendarCheck />
          </div>
          <div className="stat-info">
            <h3>Completed Activities</h3>
            <p className="stat-number">{loading ? "..." : stats.completedActivities}</p>
          </div>
        </div>
      </div>

      <div className="activities-section">
        <div className="activities-header">
          <h2>Activities</h2>
          <div className="activities-controls">
            <select
              value={`${sort.field},${sort.direction}`}
              onChange={handleSortChange}
              className="sort-select"
            >
              <option value="startDate,desc">Latest First</option>
              <option value="startDate,asc">Earliest First</option>
              <option value="activityName,asc">Name A-Z</option>
              <option value="activityName,desc">Name Z-A</option>
            </select>
            <select
              value={pagination.pageSize}
              onChange={handlePageSizeChange}
              className="page-size-select"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </div>
        </div>
        {loading && <div className="loading">Loading activities...</div>}
        {error && <div className="error-message">{error}</div>}
        {!loading && !error && activities.length === 0 ? (
          <div className="no-activities">
            <FaCalendarTimes className="no-activities-icon" />
            <p>No activities available...</p>
          </div>
        ) : (
          <>
            <div className="activities-grid">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="activity-card"
                  onClick={() => handleActivityClick(activity.id)}
                  role="button"
                  tabIndex={0}
                >
                  <h3>{activity.activityName}</h3>
                  <p className="description">{activity.description}</p>
                  <div className="activity-details">
                    <div className="venue-info">
                      <FaMapMarkerAlt className="detail-icon" />
                      <span>{activity.activityVenue}</span>
                    </div>
                    <div className="time-info">
                      <div className="date-group">
                        <FaClock className="detail-icon" />
                        <div className="date-range">
                          <div>
                            <strong>Start:</strong>
                            <time>{formatDate(activity.startDate)}</time>
                          </div>
                          <div>
                            <strong>End:</strong>
                            <time>{formatDate(activity.endDate)}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="activity-meta">
                      <div className="meta-group">
                        <span
                          className={`status-badge ${getStatusColor(
                            activity.activityStatus
                          )}`}
                        >
                          {activity.activityStatus.replace(/_/g, " ")}
                        </span>
                        <span
                          className={`category-tag ${getCategoryStyle(
                            activity.activityCategory
                          )}`}
                        >
                          {activity.activityCategory.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="capacity-badge">
                        <FaUsers className="capacity-icon" />
                        {activity.capacity}/{activity.capacity_limit}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {activities.length > 0 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>
                {[...Array(pagination.totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`pagination-btn ${
                      pagination.currentPage === index + 1 ? "active" : ""
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default AdminDashboard;
