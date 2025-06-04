import React from 'react';
import { Box, Typography, IconButton, Grid } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { StyledButton, StyledTextarea, ScheduleItem, ScheduleHeader } from '../styled';
import FormField from './FormField';

const ScheduleSection = ({
  schedules,
  onScheduleChange,
  onAddSchedule,
  onRemoveSchedule,
  errors = {},
}) => {
  const handleDateTimeChange = (index, field) => (date) => {
    onScheduleChange(index, field, date);
  };

  const handleInputChange = (index, field) => (e) => {
    onScheduleChange(index, field, e.target.value);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Activity Schedules
      </Typography>
      
      {schedules.map((schedule, index) => (
        <ScheduleItem key={index}>
          <ScheduleHeader>
            <Typography variant="subtitle1">
              Schedule {index + 1}
            </Typography>
            {schedules.length > 1 && (
              <IconButton
                onClick={() => onRemoveSchedule(index)}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            )}
          </ScheduleHeader>
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Start Time"
                  value={schedule.start_time}
                  onChange={handleDateTimeChange(index, 'start_time')}
                  renderInput={(params) => (
                    <FormField
                      {...params}
                      fullWidth
                      required
                      error={errors[`schedules[${index}].start_time`]}
                      helperText={errors[`schedules[${index}].start_time`]}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="End Time"
                  value={schedule.end_time}
                  onChange={handleDateTimeChange(index, 'end_time')}
                  renderInput={(params) => (
                    <FormField
                      {...params}
                      fullWidth
                      required
                      error={errors[`schedules[${index}].end_time`]}
                      helperText={errors[`schedules[${index}].end_time`]}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
          
          <Box mt={2}>
            <FormField
              label="Schedule Description"
              value={schedule.activity_description}
              onChange={handleInputChange(index, 'activity_description')}
              multiline
              rows={3}
              required
              error={errors[`schedules[${index}].activity_description`]}
              helperText={errors[`schedules[${index}].activity_description`]}
            />
          </Box>
          
          <Box mt={2}>
            <FormField
              label="Location"
              value={schedule.location}
              onChange={handleInputChange(index, 'location')}
              required
              error={errors[`schedules[${index}].location`]}
              helperText={errors[`schedules[${index}].location`]}
            />
          </Box>
          
          <Box mt={2}>
            <FormField
              select
              label="Status"
              value={schedule.status}
              onChange={handleInputChange(index, 'status')}
              required
            >
              <option value="WAITING_TO_START">Waiting to Start</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </FormField>
          </Box>
        </ScheduleItem>
      ))}
      
      <Box mt={2}>
        <StyledButton
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onAddSchedule}
          fullWidth
        >
          Add Schedule
        </StyledButton>
      </Box>
    </Box>
  );
};

export default ScheduleSection;
