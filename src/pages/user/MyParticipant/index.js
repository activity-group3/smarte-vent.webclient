import React, { useEffect, useState } from "react";
import { FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../Dashboard/dashboard.css";

const MyParticipant = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifyDialog, setVerifyDialog] = useState({
    open: false,
    activityId: null,
    studentCode: "",
    participantRole: "PARTICIPANT"
  });
  const [filters, setFilters] = useState({
    page: 1,
    size: 1,
    participationRole: "PARTICIPANT",
    participationStatus: "",
    registeredBefore: "",
    registeredAfter: "",
    sort: "registeredAt,desc",
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  const pageSizeOptions = [5, 10, 15, 20]; // Define page size options

  const navigate = useNavigate();

  useEffect(() => {
    fetchParticipants();
  }, [filters]);

  const fetchParticipants = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");

      // Convert datetime to ISO-8601 format
      const queryParams = new URLSearchParams({
        ...filters,
        registeredAfter: filters.registeredAfter
          ? new Date(filters.registeredAfter).toISOString()
          : "",
        registeredBefore: filters.registeredBefore
          ? new Date(filters.registeredBefore).toISOString()
          : "",
      }).toString();

      const response = await fetch(
        `http://localhost:8080/participants?${queryParams}`,
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
        const transformedResults = data.data.results.map((item) => ({
          id: item.id,
          activityName: item.activity_name,
          activityCategory: item.activity_category,
          activityVenue: item.activity_venue,
          startDate: item.start_date,
          endDate: item.end_date,
          registrationTime: item.registration_time,
          activityStatus: item.activity_status,
          participationStatus: item.participation_status,
          participationRole: item.participation_role,
          activity_id: item.activity_id,
        }));
        setParticipants(transformedResults);
        setPagination((prev) => ({
          ...prev,
          totalPages: data.data.total_pages,
        }));
      } else {
        setError(data.message || "Failed to fetch participants");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setFilters((prev) => ({
      ...prev,
      size: newSize,
      page: 1,
    }));
    // Preserve pagination visibility by keeping totalPages
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
      totalPages: Math.max(1, Math.ceil((prev.totalPages * prev.size) / newSize)),
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

  const formatRegistrationDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Format relative time
    if (diffDays === 0) {
      return "Registered today";
    } else if (diffDays === 1) {
      return "Registered yesterday";
    } else if (diffDays < 7) {
      return `Registered ${diffDays} days ago`;
    }

    // Return full date for older registrations
    return `Registered on ${new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`;
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

  const handleActivityClick = (activityId) => {
    navigate(`/activities/${activityId}`);
  };

  return (
    <main className="dashboard-main">
      <header className="dashboard-header">
        <h1>My Participant</h1>
        <p>View and manage your participation in activities</p>
      </header>

      <div className="dashboard-content">
        <div className="activities-header">
          <h2>Participants List</h2>
          <div className="activities-controls">
            <select
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
              className="sort-select"
            >
              <option value="registeredAt,desc">Latest Registration</option>
              <option value="registeredAt,asc">Earliest Registration</option>
              <option value="activityName,asc">Activity Name A-Z</option>
              <option value="activityName,desc">Activity Name Z-A</option>
            </select>
            <select
              name="participationRole"
              value={filters.participationRole}
              onChange={handleFilterChange}
              className="sort-select"
            >
              <option value="PARTICIPANT">Participant</option>
              <option value="CONTRIBUTOR">Contributor</option>
            </select>
            <select
              name="participationStatus"
              value={filters.participationStatus}
              onChange={handleFilterChange}
              className="sort-select"
            >
              <option value="">All Statuses</option>
              <option value="VERIFIED">Verified</option>
              <option value="UNVERIFIED">Unverified</option>
            </select>
            <div className="datetime-filter">
              <label htmlFor="registeredAfter">Registered After:</label>
              <input
                type="datetime-local"
                id="registeredAfter"
                name="registeredAfter"
                value={filters.registeredAfter}
                onChange={handleFilterChange}
                className="page-size-select"
              />
            </div>
            <div className="datetime-filter">
              <label htmlFor="registeredBefore">Registered Before:</label>
              <input
                type="datetime-local"
                id="registeredBefore"
                name="registeredBefore"
                value={filters.registeredBefore}
                onChange={handleFilterChange}
                className="page-size-select"
              />
            </div>
            <select
              name="pageSize"
              value={filters.size}
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

        {loading && <div className="loading">Loading participants...</div>}
        {error && <div className="error-message">{error}</div>}
        {!loading && !error && participants.length === 0 ? (
          <div className="no-activities">
            <p>No participants found</p>
          </div>
        ) : (
          <div className="activities-grid">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="activity-card"
                onClick={() => handleActivityClick(participant.activity_id)}
                role="button"
                tabIndex={0}
              >
                <h3>{participant.activityName}</h3>
                <div className="registration-info">
                  <FaClock className="detail-icon" />
                  <span>{formatRegistrationDate(participant.registrationTime)}</span>
                </div>
                <div className="activity-details">
                  <div className="venue-info">
                    <FaMapMarkerAlt className="detail-icon" />
                    <span>{participant.activityVenue}</span>
                  </div>
                  <div className="time-info">
                    <FaClock className="detail-icon" />
                    <span>
                      {formatDate(participant.startDate)} -{" "}
                      {formatDate(participant.endDate)}
                    </span>
                  </div>
                  <div className="activity-meta">
                    <div className="meta-group">
                      <span
                        className={`status-badge ${getStatusColor(
                          participant.activityStatus
                        )}`}
                      >
                        {participant.activityStatus.replace(/_/g, " ")}
                      </span>
                      <span className={`status-badge ${participant.participationStatus.toLowerCase()}`}>
                        {participant.participationStatus.replace(/_/g, " ")}
                      </span>
                      <span className={`status-badge role-${participant.participationRole.toLowerCase()}`}>
                        {participant.participationRole}
                      </span>
                    </div>
                    <span className="registration-time">
                      {new Date(participant.registrationTime).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
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
    </main>
  );
};

export default MyParticipant;
