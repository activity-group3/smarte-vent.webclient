import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  FaSignOutAlt,
  FaUser,
  FaCalendar,
  FaCog,
  FaCalendarTimes,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
} from "react-icons/fa";
import "./dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
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
    fetchActivities(pagination.currentPage);
  }, [navigate, pagination.currentPage, pagination.pageSize, sort]);

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
      console.log(data);
      if (data.status_code === 200) {
        // Transform response data from snake_case to camelCase
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
      currentPage: 1, // Reset to first page when changing page size
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
    navigate(`/activities/${id}`);
  };

  return (
    <main className="dashboard-main">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.name}</p>
      </header>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Active Activities</h3>
            <p className="stat-number">5</p>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <p className="stat-number">12</p>
          </div>
          <div className="stat-card">
            <h3>Achievements</h3>
            <p className="stat-number">8</p>
          </div>
        </div>
        <div className="activities-section">
          <div className="activities-header">
            <h2>Upcoming Activities</h2>
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
              <p>No activities coming...</p>
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
                    onClick={() =>
                      handlePageChange(pagination.currentPage - 1)
                    }
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
                    onClick={() =>
                      handlePageChange(pagination.currentPage + 1)
                    }
                    disabled={
                      pagination.currentPage === pagination.totalPages
                    }
                    className="pagination-btn"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
