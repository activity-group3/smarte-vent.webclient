import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaClock, FaMapMarkerAlt, FaUsers } from "react-icons/fa";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material';
import "./activityDetail.css";

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const [participationRole, setParticipationRole] = useState("PARTICIPANT");
  const [openJoinDialog, setOpenJoinDialog] = useState(false);

  useEffect(() => {
    fetchActivityDetail();
  }, [id]);

  const fetchActivityDetail = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://localhost:8080/activities/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.status_code === 200) {
        setActivity(data.data);
      } else {
        setError("Failed to fetch activity details");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenJoinDialog = () => {
    setOpenJoinDialog(true);
    setJoinError(null);
  };

  const handleCloseJoinDialog = () => {
    setOpenJoinDialog(false);
    setJoinError(null);
  };

  const handleRoleChange = (event) => {
    setParticipationRole(event.target.value);
  };

  const handleJoinActivity = async () => {
    setJoining(true);
    setJoinError(null);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://localhost:8080/activities/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activity_id: id,
          role: participationRole,
        }),
      });

      const data = await response.json();
      if (data.status_code <= 400) {
        setOpenJoinDialog(false);
        navigate("/my-activities");
      } else {
        setJoinError(data.message || "Failed to join activity");
      }
    } catch (err) {
      setJoinError("Network error while joining activity");
    } finally {
      setJoining(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
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

  const getScheduleStatusColor = (status) => {
    switch (status) {
      case "ONGOING":
        return "status-progress";
      case "COMPLETED":
        return "status-completed";
      case "CANCELLED":
        return "status-cancelled";
      case "PENDING":
        return "status-waiting";
      default:
        return "status-default";
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!activity) return <div className="error-message">Activity not found</div>;

  return (
    <div className="activity-detail">
      <button onClick={() => navigate(-1)} className="back-button">
        <FaArrowLeft /> Back
      </button>

      <div className="detail-header">
        <div className="header-content">
          <h1>{activity.activity_name}</h1>
          <div className="status-wrapper">
            <span
              className={`status-badge large ${getStatusColor(
                activity.activity_status
              )}`}
            >
              {activity.activity_status.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </div>

      <div className="detail-content">
        <div className="main-info">
          <p className="description">{activity.description}</p>

          <div className="info-grid">
            <div className="info-item">
              <FaMapMarkerAlt />
              <span>{activity.activity_venue}</span>
            </div>
            <div className="info-item">
              <FaUsers />
              <span className="capacity-info">
                <span className="capacity-numbers">
                  {activity.capacity} / {activity.capacity_limit}
                </span>
                <span className="capacity-label">participants</span>
              </span>
            </div>
            <div className="info-item">
              <FaClock />
              <div>
                <div>Start: {formatDate(activity.start_date)}</div>
                <div>End: {formatDate(activity.end_date)}</div>
              </div>
            </div>
          </div>

          <div className="join-section">
            {joinError && <div className="error-message">{joinError}</div>}
            <button
              className="join-button"
              onClick={handleOpenJoinDialog}
              disabled={activity.activity_status !== "WAITING_TO_START"}
            >
              Join Activity
            </button>

            <Dialog open={openJoinDialog} onClose={handleCloseJoinDialog}>
              <DialogTitle>Join Activity</DialogTitle>
              <DialogContent>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Select Role</InputLabel>
                  <Select
                    value={participationRole}
                    label="Select Role"
                    onChange={handleRoleChange}
                  >
                    <MenuItem value="PARTICIPANT">Participant</MenuItem>
                    <MenuItem value="CONTRIBUTOR">Contributor</MenuItem>
                  </Select>
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseJoinDialog}>Cancel</Button>
                <Button 
                  onClick={handleJoinActivity}
                  disabled={joining}
                  variant="contained"
                >
                  {joining ? "Joining..." : "Confirm"}
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        </div>

        <div className="schedules-section">
          <h2>Activity Schedules</h2>
          <div className="schedules-grid">
            {activity.activity_schedules?.map((schedule) => (
              <div key={schedule.id} className="schedule-card">
                <div className="schedule-header">
                  <h3>{schedule.activityDescription}</h3>
                  <span
                    className={`schedule-status ${getScheduleStatusColor(
                      schedule.status
                    )}`}
                  >
                    {schedule.status}
                  </span>
                </div>
                <p className="location">
                  <FaMapMarkerAlt /> {schedule.location}
                </p>
                <div className="schedule-time">
                  <div>Start: {formatDate(schedule.startTime)}</div>
                  <div>End: {formatDate(schedule.endTime)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetail;
