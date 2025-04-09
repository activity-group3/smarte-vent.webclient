import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaClock, FaMapMarkerAlt, FaCalendarTimes, FaUsers } from "react-icons/fa";
import "../Dashboard/dashboard.css";

const MyActivities = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 6
  });

  const [sort, setSort] = useState({
    field: "startDate",
    direction: "desc",
  });

  const pageSizeOptions = [5, 10, 15, 20];

  useEffect(() => {
    fetchJoinedActivities(pagination.currentPage);
  }, [pagination.currentPage, pagination.pageSize, sort]);

  const fetchJoinedActivities = async (page) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8080/activities/joined?page=${page}&size=${pagination.pageSize}&sort=${sort.field},${sort.direction}`,
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
        setActivities(data.data.results);
        setPagination(prev => ({
          ...prev,
          totalPages: data.data.total_pages
        }));
      } else {
        setError("Failed to fetch joined activities");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  const handleSortChange = (event) => {
    const [field, direction] = event.target.value.split(",");
    setSort({ field, direction });
  };

  const handlePageSizeChange = (event) => {
    const newPageSize = Number(event.target.value);
    setPagination((prev) => ({
      ...prev,
      pageSize: newPageSize,
      currentPage: Math.min(prev.currentPage, Math.ceil(prev.totalPages * prev.pageSize / newPageSize)), // Adjust current page if necessary
    }));
  };

  const handleActivityClick = (id) => {
    navigate(`/activities/${id}`);
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

  return (
    <div className="dashboard-main">
      <header className="dashboard-header">
        <h1>My Joined Activities</h1>
        <p>Activities you have joined</p>
      </header>

      <div className="dashboard-content">
        <div className="activities-header">
          <h2>Activities List</h2>
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
            <p>You haven't joined any activities yet</p>
          </div>
        ) : (
          <div className="activities-grid">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="activity-card"
                onClick={() => handleActivityClick(activity.id)}
                role="button"
                tabIndex={0}
              >
                <div className="activity-header">
                  <h3>{activity.activity_name}</h3>
                </div>
                <p className="description">{activity.description}</p>
                <div className="activity-details">
                  <div className="venue-info">
                    <FaMapMarkerAlt className="detail-icon" />
                    <span>{activity.activity_venue}</span>
                  </div>
                  <div className="time-info">
                    <div className="date-group">
                      <FaClock className="detail-icon" />
                      <div className="date-range">
                        <div>
                          <strong>Start:</strong>
                          <time>{formatDate(activity.start_date)}</time>
                        </div>
                        <div>
                          <strong>End:</strong>
                          <time>{formatDate(activity.end_date)}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="activity-meta">
                    <div className="meta-group">
                      <span className={`status-badge ${getStatusColor(activity.activity_status)}`}>
                        {activity.activity_status.replace(/_/g, " ")}
                      </span>
                      <span className={`category-tag ${getCategoryStyle(activity.activity_category)}`}>
                        {activity.activity_category.replace(/_/g, " ")}
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
        )}
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
      </div>
    </div>
  );
};

export default MyActivities;
