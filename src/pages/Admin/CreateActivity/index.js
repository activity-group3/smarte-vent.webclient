import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  styled,
  FormControl,
  InputLabel,
  TextareaAutosize,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import "tailwindcss/tailwind.css";
import MapLocationPicker from "@/components/MapLocationPicker";

// Custom styled components using Material-UI with Tailwind classes
const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "0.5rem",
    backgroundColor: theme.palette.background.default,
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: "0.5rem",
  backgroundColor: theme.palette.background.default,
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "0.5rem",
  padding: theme.spacing(1, 3),
  textTransform: "none",
  fontWeight: 600,
}));

const StyledTextarea = styled(TextareaAutosize)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(1.5),
  borderRadius: "0.5rem",
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.default,
  fontFamily: theme.typography.fontFamily,
  fontSize: "1rem",
  "&:hover": {
    borderColor: theme.palette.primary.main,
  },
  "&:focus": {
    outline: "none",
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
  },
}));

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
    activity_status: "SPENDING",
    capacity_limit: "",
    activity_type: "",
    activity_category: "UNIVERSITY",
    activity_description: "",
    activity_image: "",
    activity_link: "",
    attendance_score_unit: "",
    representative_organizer_id: "",
    // Add new fields
    short_description: "",
    tags: [],
    current_participants: 0,
    address: "",
    latitude: "",
    longitude: "",
    fee: "",
    is_featured: false,
    is_approved: false,
    likes: 0,
    registration_deadline: "",
  });

  // Convert datetime-local (e.g., "2025-06-15T09:00") to Instant (e.g., "2025-06-15T09:00:00Z")
  const toInstant = (datetime) => {
    if (!datetime) return "";
    return datetime.endsWith("Z") ? datetime : `${datetime}:00Z`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formattedFormData = {
      ...formData,
      start_date: toInstant(formData.start_date),
      end_date: toInstant(formData.end_date),
      registration_deadline: toInstant(formData.registration_deadline),
      capacity_limit: parseInt(formData.capacity_limit) || 0,
      representative_organizer_id:
        parseInt(formData.representative_organizer_id) || 0,
      attendance_score_unit: formData.attendance_score_unit || "0",
      current_participants: parseInt(formData.current_participants) || 0,
      latitude: parseFloat(formData.latitude) || null,
      longitude: parseFloat(formData.longitude) || null,
      likes: parseInt(formData.likes) || 0,
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
      if (response.status === 201) {
        alert('Activity created successfully!');
        navigate("/organization/activities");
      } else {
        setError(data.message || `Failed to create activity. Status: ${response.status}`);
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
    <Box className="p-6 bg-gray-50 min-h-screen">
      <Typography variant="h4" className="text-gray-800 font-bold mb-6">
        Create New Activity
      </Typography>

      {error && (
        <Alert severity="error" className="mb-6">
          {error}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md space-y-6"
      >
        {/* Activity Name */}
        <StyledTextField
          fullWidth
          label="Activity Name"
          name="activity_name"
          value={formData.activity_name}
          onChange={handleChange}
          required
          variant="outlined"
        />

        {/* Description */}
        <Box>
          <InputLabel className="text-gray-700 mb-2">Description</InputLabel>
          <StyledTextarea
            minRows={4}
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </Box>

        {/* Start and End Date */}
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StyledTextField
            fullWidth
            label="Start Date"
            type="datetime-local"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            required
            InputLabelProps={{ shrink: true }}
          />
          <StyledTextField
            fullWidth
            label="End Date"
            type="datetime-local"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            required
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        {/* Activity Venue */}
        <StyledTextField
          fullWidth
          label="Venue"
          name="activity_venue"
          value={formData.activity_venue}
          onChange={handleChange}
          required
          variant="outlined"
        />

        {/* Activity Status */}
        {/* <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <StyledSelect
            name="activity_status"
            value={formData.activity_status}
            onChange={handleChange}
            required
          >
            <MenuItem value="IN_PROGRESS">Waiting to Start</MenuItem>
            <MenuItem value="ONGOING">Ongoing</MenuItem>
            {/* <MenuItem value="COMPLETED">Completed</MenuItem> */}
            {/* <MenuItem value="PUBLISHED">PUBLISHED</MenuItem> */}
            {/* <MenuItem value="CANCELLED">CANCELLED</MenuItem> */}

          {/* </StyledSelect> */}
        {/* </FormControl> */}

        {/* Capacity Limit */}
        <StyledTextField
          fullWidth
          label="Capacity Limit"
          type="number"
          name="capacity_limit"
          value={formData.capacity_limit}
          onChange={handleChange}
          required
          inputProps={{ min: 1 }}
          variant="outlined"
        />

        {/* Activity Type */}
        {/* <StyledTextField
          fullWidth
          label="Activity Type"
          name="activity_type"
          value={formData.activity_type}
          onChange={handleChange}
          required
          variant="outlined"
        /> */}

        {/* Activity Category */}
        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <StyledSelect
            name="activity_category"
            value={formData.activity_category}
            onChange={handleChange}
            required
          >
            <MenuItem value="STUDENT_ORGANIZATION">Student Organization</MenuItem>
            <MenuItem value="UNIVERSITY">University</MenuItem>
            <MenuItem value="THIRD_PARTY">Third Party</MenuItem>
          </StyledSelect>
        </FormControl>

        {/* Detailed Description */}
        <Box>
          <InputLabel className="text-gray-700 mb-2">
            Detailed Description
          </InputLabel>
          <StyledTextarea
            minRows={4}
            name="activity_description"
            value={formData.activity_description}
            onChange={handleChange}
            required
          />
        </Box>

        {/* Activity Image */}
        <StyledTextField
          fullWidth
          label="Image URL"
          name="activity_image"
          value={formData.activity_image}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
          variant="outlined"
        />

        {/* Activity Link */}
        <StyledTextField
          fullWidth
          label="Event Link"
          name="activity_link"
          value={formData.activity_link}
          onChange={handleChange}
          placeholder="https://example.com/event"
          variant="outlined"
        />

        {/* Attendance Score Unit */}
        <StyledTextField
          fullWidth
          label="Attendance Score Unit"
          name="attendance_score_unit"
          value={formData.attendance_score_unit}
          onChange={handleChange}
          required
          variant="outlined"
        />

        {/* Representative Organizer ID */}
        {/* <StyledTextField
          fullWidth
          label="Organizer ID"
          type="number"
          name="representative_organizer_id"
          value={formData.representative_organizer_id}
          onChange={handleChange}
          required
          inputProps={{ min: 1 }}
          variant="outlined"
        /> */}

        {/* Short Description */}
        <StyledTextField
          fullWidth
          label="Short Description"
          name="short_description"
          value={formData.short_description}
          onChange={handleChange}
          variant="outlined"
          multiline
          rows={2}
        />

        {/* Tags */}
        <StyledTextField
          fullWidth
          label="Tags (comma-separated)"
          name="tags"
          value={formData.tags.join(", ")}
          onChange={(e) => {
            const tagsArray = e.target.value
              .split(",")
              .map((tag) => tag.trim());
            setFormData((prev) => ({
              ...prev,
              tags: tagsArray,
            }));
          }}
          variant="outlined"
          placeholder="e.g. workshop, technology, career"
        />

        {/* Location Details */}
        <Box className="space-y-4">
          <Typography variant="h6" className="text-gray-800 font-semibold">
            Location Details
          </Typography>
          <MapLocationPicker
            onLocationSelect={({ address, latitude, longitude }) => {
              setFormData((prev) => ({
                ...prev,
                address,
                latitude: latitude.toString(),
                longitude: longitude.toString(),
              }));
            }}
          />
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StyledTextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              variant="outlined"
              disabled
            />
            <Box className="grid grid-cols-2 gap-4">
              <StyledTextField
                fullWidth
                label="Latitude"
                name="latitude"
                type="number"
                value={formData.latitude}
                onChange={handleChange}
                variant="outlined"
                disabled
              />
              <StyledTextField
                fullWidth
                label="Longitude"
                name="longitude"
                type="number"
                value={formData.longitude}
                onChange={handleChange}
                variant="outlined"
                disabled
              />
            </Box>
          </Box>
        </Box>

        {/* Fee */}
        <StyledTextField
          fullWidth
          label="Fee"
          name="fee"
          value={formData.fee}
          onChange={handleChange}
          variant="outlined"
          placeholder="Free or amount"
        />

        {/* Registration Deadline */}
        <StyledTextField
          fullWidth
          label="Registration Deadline"
          type="datetime-local"
          name="registration_deadline"
          value={formData.registration_deadline}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          variant="outlined"
        />

        {/* Featured and Approved Status */}
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormControl>
            <InputLabel>Featured Status</InputLabel>
            <StyledSelect
              name="is_featured"
              value={formData.is_featured}
              onChange={handleChange}
            >
              <MenuItem value={true}>Featured</MenuItem>
              <MenuItem value={false}>Not Featured</MenuItem>
            </StyledSelect>
          </FormControl>

          <FormControl>
            <InputLabel>Approval Status</InputLabel>
            <StyledSelect
              name="is_approved"
              value={formData.is_approved}
              // onChange={handleChange}
            >
              <MenuItem value={true}>Approved</MenuItem>
              <MenuItem value={false}>Not Approved</MenuItem>
            </StyledSelect>
          </FormControl>
        </Box>

        {/* Activity Schedules */}
        <Box className="space-y-4">
          <Typography variant="h6" className="text-gray-800 font-semibold">
            Activity Schedules
          </Typography>
          {schedules.map((schedule, index) => (
            <Box
              key={index}
              className="p-4 bg-gray-50 rounded-lg shadow-sm space-y-4"
            >
              <Box className="flex justify-between items-center">
                <Typography
                  variant="subtitle1"
                  className="text-gray-700 font-medium"
                >
                  Schedule {index + 1}
                </Typography>
                {schedules.length > 1 && (
                  <IconButton
                    color="error"
                    onClick={() => removeSchedule(index)}
                    className="hover:text-red-600"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StyledTextField
                  fullWidth
                  label="Start Time"
                  type="datetime-local"
                  value={schedule.start_time}
                  onChange={(e) =>
                    handleScheduleChange(index, "start_time", e.target.value)
                  }
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
                <StyledTextField
                  fullWidth
                  label="End Time"
                  type="datetime-local"
                  value={schedule.end_time}
                  onChange={(e) =>
                    handleScheduleChange(index, "end_time", e.target.value)
                  }
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
              </Box>
              <Box>
                <InputLabel className="text-gray-700 mb-2">
                  Schedule Description
                </InputLabel>
                <StyledTextarea
                  minRows={3}
                  value={schedule.activity_description}
                  onChange={(e) =>
                    handleScheduleChange(
                      index,
                      "activity_description",
                      e.target.value
                    )
                  }
                  required
                />
              </Box>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <StyledSelect
                  value={schedule.status}
                  onChange={(e) =>
                    handleScheduleChange(index, "status", e.target.value)
                  }
                  required
                >
                  <MenuItem value="WAITING_TO_START">Waiting to Start</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                </StyledSelect>
              </FormControl>
              <StyledTextField
                fullWidth
                label="Location"
                value={schedule.location}
                onChange={(e) =>
                  handleScheduleChange(index, "location", e.target.value)
                }
                required
                variant="outlined"
              />
            </Box>
          ))}
          <StyledButton
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addSchedule}
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Add Schedule
          </StyledButton>
        </Box>

        <StyledButton
          type="submit"
          variant="contained"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Create Activity"
          )}
        </StyledButton>
      </Box>
    </Box>
  );
};

export default CreateActivity;
