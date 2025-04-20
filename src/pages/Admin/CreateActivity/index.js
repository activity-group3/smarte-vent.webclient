import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaTrash } from "react-icons/fa";
import "./createActivity.css";

const CreateActivity = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [schedules, setSchedules] = useState([
    {
      start_time: "",
      end_time: "",
      activity_description: "",
      status: "WAITING_TO_START",
      location: "",
    },
  ]);

  const [formData, setFormData] = useState({
    activity_name: "",
    description: "",
    start_date: "",
    end_date: "",
    activity_venue: "",
    activity_status: "WAITING_TO_START",
    capacity_limit: "",
    activity_type: "",
    activity_category: "UNIVERSITY",
    activity_description: "",
    activity_image: "",
    activity_link: "",
    attendance_score_unit: "",
    representative_organizer_id: "",
  });

  // Convert datetime-local (e.g., "2025-06-15T09:00") to Instant (e.g., "2025-06-15T09:00:00Z")
  const toInstant = (datetime) => {
    if (!datetime) return "";
    // Append seconds and UTC 'Z' if not present
    return datetime.endsWith("Z") ? datetime : `${datetime}:00Z`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Convert datetime fields to Instant format
    const formattedFormData = {
      ...formData,
      start_date: toInstant(formData.start_date),
      end_date: toInstant(formData.end_date),
      capacity_limit: parseInt(formData.capacity_limit) || 0,
      representative_organizer_id: parseInt(formData.representative_organizer_id) || 0,
      attendance_score_unit: formData.attendance_score_unit || "0",
      activity_schedules: schedules.map((schedule) => ({
        ...schedule,
        start_time: toInstant(schedule.start_time),
        end_time: toInstant(schedule.end_time),
      })),
    };

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8080/activities/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedFormData),
      });

      const data = await response.json();
      if (data.status_code === 200) {
        navigate("/dashboard");
      } else {
        setError(data.message || "Failed to create activity");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleScheduleChange = (index, field, value) => {
    const newSchedules = [...schedules];
    newSchedules[index] = {
      ...newSchedules[index],
      [field]: value,
    };
    setSchedules(newSchedules);
  };

  const addSchedule = () => {
    setSchedules([
      ...schedules,
      {
        start_time: "",
        end_time: "",
        activity_description: "",
        status: "WAITING_TO_START",
        location: "",
      },
    ]);
  };

  const removeSchedule = (index) => {
    if (schedules.length > 1) {
      setSchedules(schedules.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="create-activity">
      <h1>Create New Activity</h1>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="create-form">
        {/* Activity Name */}
        <div className="form-group">
          <label>Activity Name</label>
          <input
            type="text"
            name="activity_name"
            value={formData.activity_name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        {/* Start and End Date */}
        <div className="form-row">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="datetime-local"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="datetime-local"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Activity Venue */}
        <div className="form-group">
          <label>Venue</label>
          <input
            type="text"
            name="activity_venue"
            value={formData.activity_venue}
            onChange={handleChange}
            required
          />
        </div>

        {/* Activity Status */}
        <div className="form-group">
          <label>Status</label>
          <select
            name="activity_status"
            value={formData.activity_status}
            onChange={handleChange}
            required
          >
            <option value="WAITING_TO_START">Waiting to Start</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* Capacity Limit */}
        <div className="form-group">
          <label>Capacity Limit</label>
          <input
            type="number"
            name="capacity_limit"
            value={formData.capacity_limit}
            onChange={handleChange}
            required
            min="1"
          />
        </div>

        {/* Activity Type */}
        <div className="form-group">
          <label>Activity Type</label>
          <input
            type="text"
            name="activity_type"
            value={formData.activity_type}
            onChange={handleChange}
            required
          />
        </div>

        {/* Activity Category */}
        <div className="form-group">
          <label>Category</label>
          <select
            name="activity_category"
            value={formData.activity_category}
            onChange={handleChange}
            required
          >
            <option value="UNIVERSITY">University</option>
            <option value="COMMUNITY">Community</option>
            <option value="PROFESSIONAL">Professional</option>
          </select>
        </div>

        {/* Detailed Description */}
        <div className="form-group">
          <label>Detailed Description</label>
          <textarea
            name="activity_description"
            value={formData.activity_description}
            onChange={handleChange}
            required
          />
        </div>

        {/* Activity Image */}
        <div className="form-group">
          <label>Image URL</label>
          <input
            type="url"
            name="activity_image"
            value={formData.activity_image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Activity Link */}
        <div className="form-group">
          <label>Event Link</label>
          <input
            type="url"
            name="activity_link"
            value={formData.activity_link}
            onChange={handleChange}
            placeholder="https://example.com/event"
          />
        </div>

        {/* Attendance Score Unit */}
        <div className="form-group">
          <label>Attendance Score Unit</label>
          <input
            type="text"
            name="attendance_score_unit"
            value={formData.attendance_score_unit}
            onChange={handleChange}
            required
          />
        </div>

        {/* Representative Organizer ID */}
        <div className="form-group">
          <label>Organizer ID</label>
          <input
            type="number"
            name="representative_organizer_id"
            value={formData.representative_organizer_id}
            onChange={handleChange}
            required
            min="1"
          />
        </div>

        {/* Activity Schedules */}
        <div className="schedules-section">
          <h2>Activity Schedules</h2>
          {schedules.map((schedule, index) => (
            <div key={index} className="schedule-item">
              <div className="schedule-header">
                <h3>Schedule {index + 1}</h3>
                {schedules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSchedule(index)}
                    className="remove-schedule"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="datetime-local"
                    value={schedule.start_time}
                    onChange={(e) =>
                      handleScheduleChange(index, "start_time", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="datetime-local"
                    value={schedule.end_time}
                    onChange={(e) =>
                      handleScheduleChange(index, "end_time", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Schedule Description</label>
                <textarea
                  value={schedule.activity_description}
                  onChange={(e) =>
                    handleScheduleChange(index, "activity_description", e.target.value)
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={schedule.status}
                  onChange={(e) =>
                    handleScheduleChange(index, "status", e.target.value)
                  }
                  required
                >
                  <option value="WAITING_TO_START">Waiting to Start</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={schedule.location}
                  onChange={(e) =>
                    handleScheduleChange(index, "location", e.target.value)
                  }
                  required
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addSchedule}
            className="add-schedule-btn"
          >
            <FaPlus /> Add Schedule
          </button>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Creating..." : "Create Activity"}
        </button>
      </form>
    </div>
  );
};

export default CreateActivity;
