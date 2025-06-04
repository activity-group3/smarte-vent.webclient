import React, { useState, useCallback, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';
import { StyledButton, FormSection, FormActions } from './styled';
import FormField from './components/FormField';
import ScheduleSection from './components/ScheduleSection';
import LocationPicker from './components/LocationPicker';

// Validation schema
const validationSchema = Yup.object().shape({
  activity_name: Yup.string().required('Activity name is required'),
  description: Yup.string().required('Description is required'),
  start_date: Yup.date().required('Start date is required'),
  end_date: Yup.date()
    .required('End date is required')
    .min(Yup.ref('start_date'), 'End date must be after start date'),
  activity_status: Yup.string().required('Status is required'),
  capacity_limit: Yup.number()
    .required('Capacity is required')
    .min(1, 'Minimum capacity is 1'),
  activity_category: Yup.string().required('Category is required'),
  attendance_score_unit: Yup.string().required('Score unit is required'),
  activity_schedules: Yup.array().of(
    Yup.object().shape({
      start_time: Yup.date().required('Start time is required'),
      end_time: Yup.date()
        .required('End time is required')
        .min(Yup.ref('start_time'), 'End time must be after start time'),
      activity_description: Yup.string().required('Description is required'),
      location: Yup.string().required('Location is required'),
      status: Yup.string().required('Status is required'),
    })
  ),
});

const ActivityForm = ({ activity, onSubmit, onCancel, loading = false }) => {
  const [initialValues, setInitialValues] = useState({
    id: '',
    activity_name: '',
    description: '',
    start_date: null,
    end_date: null,
    activity_venue: '',
    activity_status: 'WAITING_TO_START',
    capacity_limit: '',
    activity_category: 'STUDENT_ORGANIZATION',
    activity_description: '',
    activity_image: '',
    activity_link: '',
    attendance_score_unit: '',
    activity_schedules: [
      {
        start_time: null,
        end_time: null,
        activity_description: '',
        status: 'WAITING_TO_START',
        location: '',
      },
    ],
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

  // Process initial values when activity prop changes
  useEffect(() => {
    if (activity) {
      const processedActivity = {
        ...activity,
        start_date: activity.start_date ? parseISO(activity.start_date) : null,
        end_date: activity.end_date ? parseISO(activity.end_date) : null,
        registration_deadline: activity.registration_deadline 
          ? parseISO(activity.registration_deadline) 
          : null,
        activity_schedules: activity.activity_schedules?.length > 0
          ? activity.activity_schedules.map(schedule => ({
              ...schedule,
              start_time: schedule.start_time ? parseISO(schedule.start_time) : null,
              end_time: schedule.end_time ? parseISO(schedule.end_time) : null,
            }))
          : [{
              start_time: null,
              end_time: null,
              activity_description: '',
              status: 'WAITING_TO_START',
              location: '',
            }],
      };
      setInitialValues(processedActivity);
    }
  }, [activity]);

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        // Format dates for API
        const formattedValues = {
          ...values,
          start_date: values.start_date ? format(values.start_date, "yyyy-MM-dd'T'HH:mm:ssxxx") : null,
          end_date: values.end_date ? format(values.end_date, "yyyy-MM-dd'T'HH:mm:ssxxx") : null,
          registration_deadline: values.registration_deadline 
            ? format(values.registration_deadline, "yyyy-MM-dd'T'HH:mm:ssxxx") 
            : null,
          activity_schedules: values.activity_schedules.map(schedule => ({
            ...schedule,
            start_time: schedule.start_time ? format(schedule.start_time, "yyyy-MM-dd'T'HH:mm:ssxxx") : null,
            end_time: schedule.end_time ? format(schedule.end_time, "yyyy-MM-dd'T'HH:mm:ssxxx") : null,
          })),
        };
        
        await onSubmit(formattedValues);
      } catch (error) {
        console.error('Form submission error:', error);
        setFieldError('submit', error.message || 'Failed to submit form');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleScheduleChange = useCallback((index, field, value) => {
    formik.setFieldValue(
      `activity_schedules[${index}].${field}`,
      value
    );
  }, [formik]);

  const addSchedule = useCallback(() => {
    const newSchedules = [...formik.values.activity_schedules, {
      start_time: null,
      end_time: null,
      activity_description: '',
      status: 'WAITING_TO_START',
      location: '',
    }];
    formik.setFieldValue('activity_schedules', newSchedules);
  }, [formik]);

  const removeSchedule = useCallback((index) => {
    if (formik.values.activity_schedules.length > 1) {
      const newSchedules = formik.values.activity_schedules.filter((_, i) => i !== index);
      formik.setFieldValue('activity_schedules', newSchedules);
    }
  }, [formik]);

  const handleLocationSelect = useCallback((location) => {
    Object.entries(location).forEach(([key, value]) => {
      formik.setFieldValue(key, value);
    });
  }, [formik]);

  const handleTagsChange = (e) => {
    const tagsArray = e.target.value.split(',').map(tag => tag.trim());
    formik.setFieldValue('tags', tagsArray);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <form onSubmit={formik.handleSubmit}>
        {formik.errors.submit && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {formik.errors.submit}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormSection>
              <FormField
                name="activity_name"
                label="Activity Name"
                value={formik.values.activity_name}
                onChange={formik.handleChange}
                error={formik.touched.activity_name && formik.errors.activity_name}
                helperText={formik.touched.activity_name && formik.errors.activity_name}
                required
              />
            </FormSection>

            <FormSection>
              <FormField
                name="description"
                label="Description"
                value={formik.values.description}
                onChange={formik.handleChange}
                multiline
                rows={4}
                error={formik.touched.description && formik.errors.description}
                helperText={formik.touched.description && formik.errors.description}
                required
              />
            </FormSection>

            <FormSection>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormField
                    name="start_date"
                    label="Start Date"
                    type="datetime-local"
                    value={formik.values.start_date}
                    onChange={formik.handleChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    error={formik.touched.start_date && formik.errors.start_date}
                    helperText={formik.touched.start_date && formik.errors.start_date}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormField
                    name="end_date"
                    label="End Date"
                    type="datetime-local"
                    value={formik.values.end_date}
                    onChange={formik.handleChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    error={formik.touched.end_date && formik.errors.end_date}
                    helperText={formik.touched.end_date && formik.errors.end_date}
                    required
                  />
                </Grid>
              </Grid>
            </FormSection>

            <FormSection>
              <LocationPicker
                formData={{
                  address: formik.values.address,
                  latitude: formik.values.latitude,
                  longitude: formik.values.longitude,
                }}
                onLocationSelect={handleLocationSelect}
                errors={{
                  address: formik.touched.address && formik.errors.address,
                  latitude: formik.touched.latitude && formik.errors.latitude,
                  longitude: formik.touched.longitude && formik.errors.longitude,
                }}
              />
            </FormSection>

            <FormSection>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormField
                    select
                    name="activity_status"
                    label="Status"
                    value={formik.values.activity_status}
                    onChange={formik.handleChange}
                    error={formik.touched.activity_status && formik.errors.activity_status}
                    helperText={formik.touched.activity_status && formik.errors.activity_status}
                    required
                  >
                    <MenuItem value="WAITING_TO_START">Waiting to Start</MenuItem>
                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                  </FormField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormField
                    name="capacity_limit"
                    label="Capacity Limit"
                    type="number"
                    value={formik.values.capacity_limit}
                    onChange={formik.handleChange}
                    error={formik.touched.capacity_limit && formik.errors.capacity_limit}
                    helperText={formik.touched.capacity_limit && formik.errors.capacity_limit}
                    required
                    inputProps={{ min: 1 }}
                  />
                </Grid>
              </Grid>
            </FormSection>

            <FormSection>
              <FormField
                select
                name="activity_category"
                label="Category"
                value={formik.values.activity_category}
                onChange={formik.handleChange}
                error={formik.touched.activity_category && formik.errors.activity_category}
                helperText={formik.touched.activity_category && formik.errors.activity_category}
                required
              >
                <MenuItem value="STUDENT_ORGANIZATION">Student Organization</MenuItem>
                <MenuItem value="UNIVERSITY">University</MenuItem>
                <MenuItem value="THIRD_PARTY">Third Party</MenuItem>
              </FormField>
            </FormSection>

            <FormSection>
              <FormField
                name="activity_image"
                label="Image URL"
                value={formik.values.activity_image}
                onChange={formik.handleChange}
                placeholder="https://example.com/image.jpg"
                error={formik.touched.activity_image && formik.errors.activity_image}
                helperText={formik.touched.activity_image && formik.errors.activity_image}
              />
            </FormSection>

            <FormSection>
              <FormField
                name="activity_link"
                label="Event Link"
                value={formik.values.activity_link}
                onChange={formik.handleChange}
                placeholder="https://example.com/event"
                error={formik.touched.activity_link && formik.errors.activity_link}
                helperText={formik.touched.activity_link && formik.errors.activity_link}
              />
            </FormSection>

            <FormSection>
              <FormField
                name="attendance_score_unit"
                label="Attendance Score Unit"
                value={formik.values.attendance_score_unit}
                onChange={formik.handleChange}
                error={formik.touched.attendance_score_unit && formik.errors.attendance_score_unit}
                helperText={formik.touched.attendance_score_unit && formik.errors.attendance_score_unit}
                required
              />
            </FormSection>

            <FormSection>
              <FormField
                name="short_description"
                label="Short Description"
                value={formik.values.short_description}
                onChange={formik.handleChange}
                multiline
                rows={2}
                error={formik.touched.short_description && formik.errors.short_description}
                helperText={formik.touched.short_description && formik.errors.short_description}
              />
            </FormSection>

            <FormSection>
              <FormField
                name="tags"
                label="Tags (comma-separated)"
                value={formik.values.tags.join(', ')}
                onChange={handleTagsChange}
                placeholder="e.g. workshop, technology, career"
                error={formik.touched.tags && formik.errors.tags}
                helperText={formik.touched.tags && formik.errors.tags}
              />
            </FormSection>

            <FormSection>
              <FormField
                name="fee"
                label="Fee"
                value={formik.values.fee}
                onChange={formik.handleChange}
                placeholder="Free or amount"
                error={formik.touched.fee && formik.errors.fee}
                helperText={formik.touched.fee && formik.errors.fee}
              />
            </FormSection>

            <FormSection>
              <FormField
                name="registration_deadline"
                label="Registration Deadline"
                type="datetime-local"
                value={formik.values.registration_deadline}
                onChange={formik.handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                error={formik.touched.registration_deadline && formik.errors.registration_deadline}
                helperText={formik.touched.registration_deadline && formik.errors.registration_deadline}
              />
            </FormSection>

            <FormSection>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="is_featured"
                        checked={formik.values.is_featured}
                        onChange={formik.handleChange}
                        color="primary"
                      />
                    }
                    label="Featured"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="is_approved"
                        checked={formik.values.is_approved}
                        onChange={formik.handleChange}
                        color="primary"
                      />
                    }
                    label="Approved"
                  />
                </Grid>
              </Grid>
            </FormSection>

            <FormSection>
              <ScheduleSection
                schedules={formik.values.activity_schedules}
                onScheduleChange={handleScheduleChange}
                onAddSchedule={addSchedule}
                onRemoveSchedule={removeSchedule}
                errors={formik.errors.activity_schedules}
              />
            </FormSection>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <FormActions>
          <StyledButton
            type="button"
            variant="outlined"
            onClick={onCancel}
            disabled={formik.isSubmitting || loading}
          >
            Cancel
          </StyledButton>
          <StyledButton
            type="submit"
            variant="contained"
            color="primary"
            disabled={formik.isSubmitting || loading}
            startIcon={formik.isSubmitting || loading ? <CircularProgress size={20} /> : null}
          >
            {formik.isSubmitting || loading ? 'Saving...' : 'Save Activity'}
          </StyledButton>
        </FormActions>
      </form>
    </LocalizationProvider>
  );
};

export default ActivityForm;
