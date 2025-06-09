import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Alert,
  IconButton,
  CircularProgress,
  styled,
  TextareaAutosize,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import MapLocationPicker from './MapLocationPicker';

// Custom styled components using Material-UI with Tailwind classes
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '0.5rem',
    backgroundColor: theme.palette.background.default,
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: '0.5rem',
  backgroundColor: theme.palette.background.default,
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '0.5rem',
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  fontWeight: 600,
}));

const StyledTextarea = styled(TextareaAutosize)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1.5),
  borderRadius: '0.5rem',
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.default,
  fontFamily: theme.typography.fontFamily,
  fontSize: '1rem',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
  '&:focus': {
    outline: 'none',
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
  },
}));

const ActivityUpdateForm = ({ activity, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    id: '',
    activity_name: '',
    description: '',
    start_date: null,
    end_date: null,
    activity_venue: '',
    activity_status: '',
    capacity_limit: '',
    activity_category: '',
    activity_description: '',
    activity_image: '',
    activity_link: '',
    attendance_score_unit: '',
    activity_schedules: [],
    short_description: '',
    tags: [],
    current_participants: 0,
    address: '',
    latitude: '',
    longitude: '',
    fee: '',
    is_featured: false,
    is_approved: false,
    likes: 0,
    registration_deadline: null,
  });

  const [schedules, setSchedules] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activity) {
      // Convert date strings to Date objects for form fields
      setFormData({
        ...activity,
        start_date: activity.start_date ? new Date(activity.start_date) : null,
        end_date: activity.end_date ? new Date(activity.end_date) : null,
        registration_deadline: activity.registration_deadline ? new Date(activity.registration_deadline) : null,
      });
      
      // Process schedules - convert string dates to Date objects
      if (activity.activity_schedules && activity.activity_schedules.length > 0) {
        const processedSchedules = activity.activity_schedules.map(schedule => ({
          ...schedule,
          start_time: schedule.start_time ? new Date(schedule.start_time) : '',
          end_time: schedule.end_time ? new Date(schedule.end_time) : ''
        }));
        setSchedules(processedSchedules);
      } else {
        // Initialize with one empty schedule if none exist
        setSchedules([{
          start_time: '',
          end_time: '',
          activity_description: '',
          status: 'WAITING_TO_START',
          location: ''
        }]);
      }
    }
  }, [activity]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (name) => (date) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  const handleLocationSelect = (location) => {
    setFormData((prev) => ({
      ...prev,
      activity_venue: location.address,
      address: location.address,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
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
        start_time: '',
        end_time: '',
        activity_description: '',
        status: 'WAITING_TO_START',
        location: '',
      },
    ]);
  };

  const removeSchedule = (index) => {
    if (schedules.length > 1) {
      setSchedules(schedules.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Format dates for API
      const formattedData = {
        ...formData,
        start_date: formData.start_date ? formData.start_date.toISOString() : null,
        end_date: formData.end_date ? formData.end_date.toISOString() : null,
        registration_deadline: formData.registration_deadline
          ? formData.registration_deadline.toISOString()
          : null,
        activity_schedules: schedules.map(schedule => ({
          ...schedule,
          // Ensure dates are properly formatted
          start_time: schedule.start_time && typeof schedule.start_time === 'object' 
            ? schedule.start_time.toISOString() 
            : schedule.start_time,
          end_time: schedule.end_time && typeof schedule.end_time === 'object' 
            ? schedule.end_time.toISOString() 
            : schedule.end_time,
        })),
      };

      // Call the parent's onSubmit handler
      await onSubmit(formattedData);
      setSuccess(true);
      setLoading(false);
    } catch (error) {
      console.error('Error updating activity:', error);
      setError('Failed to update activity. Please try again.');
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit} className="space-y-6">
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">Activity updated successfully!</Alert>}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              label="Activity Name"
              name="activity_name"
              value={formData.activity_name}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12}>
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
          </Grid>

          <Grid item xs={12} md={6}>
            <DateTimePicker
              label="Start Date"
              value={formData.start_date}
              onChange={handleDateChange('start_date')}
              renderInput={(params) => <StyledTextField {...params} fullWidth required />}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DateTimePicker
              label="End Date"
              value={formData.end_date}
              onChange={handleDateChange('end_date')}
              renderInput={(params) => <StyledTextField {...params} fullWidth required />}
            />
          </Grid>

          <Grid item xs={12}>
            <MapLocationPicker onLocationSelect={handleLocationSelect} />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <StyledSelect
                name="activity_status"
                value={formData.activity_status}
                onChange={handleChange}
                label="Status"
                required
              >
                <MenuItem value="WAITING_TO_START">Waiting to Start</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </StyledSelect>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <StyledTextField
              fullWidth
              label="Capacity Limit"
              name="capacity_limit"
              type="number"
              value={formData.capacity_limit}
              onChange={handleChange}
              required
              inputProps={{ min: 1 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <StyledSelect
                name="activity_category"
                value={formData.activity_category}
                onChange={handleChange}
                label="Category"
                required
              >
                <MenuItem value="STUDENT_ORGANIZATION">Student Organization</MenuItem>
                <MenuItem value="UNIVERSITY">University</MenuItem>
                <MenuItem value="THIRD_PARTY">Third Party</MenuItem>
              </StyledSelect>
            </FormControl>
          </Grid>



          {/* <Grid item xs={12}>
            <Box>
              <InputLabel className="text-gray-700 mb-2">Detailed Description</InputLabel>
              <StyledTextarea
                minRows={4}
                name="activity_description"
                value={formData.activity_description}
                onChange={handleChange}
                required
              />
            </Box>
          </Grid> */}

          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              label="Image URL"
              name="activity_image"
              value={formData.activity_image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </Grid>

          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              label="Event Link"
              name="activity_link"
              value={formData.activity_link}
              onChange={handleChange}
              placeholder="https://example.com/event"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <StyledTextField
              fullWidth
              label="Attendance Score Unit"
              name="attendance_score_unit"
              value={formData.attendance_score_unit}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              label="Short Description"
              name="short_description"
              value={formData.short_description}
              onChange={handleChange}
              multiline
              rows={2}
            />
          </Grid>

          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              label="Tags (comma-separated)"
              name="tags"
              value={formData.tags.join(', ')}
              onChange={(e) => {
                const tagsArray = e.target.value.split(',').map(tag => tag.trim());
                setFormData(prev => ({
                  ...prev,
                  tags: tagsArray,
                }));
              }}
              placeholder="e.g. workshop, technology, career"
            />
          </Grid>

          <Grid item xs={12}>
            <Box className="space-y-4">
              <Typography variant="h6" className="text-gray-800 font-semibold">
                Location Details
              </Typography>
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StyledTextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
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
                    disabled
                  />
                  <StyledTextField
                    fullWidth
                    label="Longitude"
                    name="longitude"
                    type="number"
                    value={formData.longitude}
                    onChange={handleChange}
                    disabled
                  />
                </Box>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              label="Fee"
              name="fee"
              value={formData.fee}
              onChange={handleChange}
              placeholder="Free or amount"
            />
          </Grid>

          <Grid item xs={12}>
            <DateTimePicker
              label="Registration Deadline"
              value={formData.registration_deadline}
              onChange={handleDateChange('registration_deadline')}
              renderInput={(params) => <StyledTextField {...params} fullWidth />}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
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
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Approval Status</InputLabel>
              <StyledSelect
                name="is_approved"
                value={formData.is_approved}
                onChange={handleChange}
              >
                <MenuItem value={true}>Approved</MenuItem>
                <MenuItem value={false}>Not Approved</MenuItem>
              </StyledSelect>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
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
                    <Typography variant="subtitle1" className="text-gray-700 font-medium">
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
                    <DateTimePicker
                      label="Start Time"
                      value={schedule.start_time}
                      onChange={(date) => handleScheduleChange(index, 'start_time', date)}
                      renderInput={(params) => <StyledTextField {...params} fullWidth required />}
                    />
                    <DateTimePicker
                      label="End Time"
                      value={schedule.end_time}
                      onChange={(date) => handleScheduleChange(index, 'end_time', date)}
                      renderInput={(params) => <StyledTextField {...params} fullWidth required />}
                    />
                  </Box>
                  <Box>
                    <InputLabel className="text-gray-700 mb-2">
                      Schedule Description
                    </InputLabel>
                    <StyledTextarea
                      minRows={3}
                      value={schedule.activity_description}
                      onChange={(e) => handleScheduleChange(index, 'activity_description', e.target.value)}
                      required
                    />
                  </Box>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <StyledSelect
                      value={schedule.status}
                      onChange={(e) => handleScheduleChange(index, 'status', e.target.value)}
                      required
                    >
                      <MenuItem value="WAITING_TO_START">Waiting to Start</MenuItem>
                      <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                      <MenuItem value="COMPLETED">Completed</MenuItem>
                      <MenuItem value="CANCELLED">Cancelled</MenuItem>
                    </StyledSelect>
                  </FormControl>
                  <StyledTextField
                    fullWidth
                    label="Location"
                    value={schedule.location}
                    onChange={(e) => handleScheduleChange(index, 'location', e.target.value)}
                    required
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
          </Grid>
        </Grid>

        <Box className="flex justify-end space-x-4 mt-6">
          <StyledButton
            variant="outlined"
            onClick={onCancel}
            className="px-6"
          >
            Cancel
          </StyledButton>
          <StyledButton
            type="submit"
            variant="contained"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Update Activity'
            )}
          </StyledButton>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default ActivityUpdateForm; 
