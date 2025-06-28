import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Chip,
  Divider,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  SelectChangeEvent,
} from '@mui/material';
import { Close as CloseIcon, Check as CheckIcon, Clear as ClearIcon, Schedule as ScheduleIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import './activityDetail.css';
import { Activity, Participant, ParticipationStatus, ActivitySchedule } from '@/types/entities';

interface ActivityParticipantManagementProps {
  activityId: string;
  open?: boolean;
  onClose: () => void;
}

const ActivityParticipantManagement: React.FC<ActivityParticipantManagementProps> = ({ activityId, open = true, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [activity, setActivity] = useState<Activity | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<number>(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filters, setFilters] = useState({
    participationStatus: '',
    search: '',
  });

  const fetchActivity = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8080/activities/${activityId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.status_code === 200) {
        setActivity(data.data);
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  };

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      let queryString = `activityId=${activityId}&page=${page}&size=10`;

      if (filters.participationStatus) {
        queryString += `&participationStatus=${filters.participationStatus}`;
      }
      if (filters.search) {
        queryString += `&search=${encodeURIComponent(filters.search)}`;
      }

      const response = await fetch(`http://localhost:8080/participants?${queryString}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setParticipants(data.data.results);
        setTotalPages(data.data.total_pages);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activityId) {
      fetchActivity();
      fetchParticipants();
    }
  }, [activityId, page, filters]);

  const handleVerify = async (participantId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `http://localhost:8080/participants/${participantId}/verify`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Refresh participants
        fetchParticipants();
      }
    } catch (error) {
      console.error('Error verifying participant:', error);
    }
  };

  const handleReject = async (participantId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `http://localhost:8080/participants/${participantId}/reject`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Refresh participants
        fetchParticipants();
      }
    } catch (error) {
      console.error('Error rejecting participant:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'success';
      case 'UNVERIFIED':
        return 'warning';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getActivityStatusClass = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'status-progress';
      case 'COMPLETED':
        return 'status-completed';
      case 'CANCELLED':
        return 'status-cancelled';
      case 'PUBLISHED':
        return 'status-waiting';
      default:
        return 'status-default';
    }
  };

  const getScheduleStatus = (schedule: ActivitySchedule) => {
    const now = new Date();
    const start = new Date(schedule.start_time);
    const end = new Date(schedule.end_time);

    if (now < start) return 'UPCOMING';
    if (now >= start && now <= end) return 'IN_PROGRESS';
    return 'FINISHED';
  };

  const getScheduleStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'primary.main';
      case 'FINISHED':
        return 'success.main';
      default:
        return 'text.secondary';
    }
  };

  if (!activity) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={fullScreen}
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
          width: '80%',
          maxWidth: '1200px',
          m: 2,
        },
      }}
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'flex-start',
          pt: 4,
        },
      }}
    >
      <DialogTitle sx={{ pb: 0 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="div" fontWeight="bold">
            {activity?.activity_name || 'Participant Management'}
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ ml: 2 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box className="activity-detail" sx={{ p: 2 }}>
          <Box className="detail-header" sx={{ mb: 3 }}>
            <Box className="header-content">
              <Typography variant="h4" component="h1" gutterBottom>
                {activity.activity_name}
              </Typography>
              <Box className="status-wrapper">
                <Chip
                  label={activity.activity_status ? activity.activity_status.replace(/_/g, ' ') : 'UNKNOWN'}
                  className={`status-badge large ${getActivityStatusClass(activity.activity_status || '')}`}
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 'medium',
                    px: 2,
                    py: 1,
                  }}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ width: '100%', mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                mb: 2,
                '& .MuiTabs-flexContainer': {
                  gap: 1,
                },
              }}
            >
              <Tab label="Activity Details" />
              <Tab label={`Participants (${participants.length})`} />
            </Tabs>
          </Box>

          <Box className="tab-content" sx={{ mt: 2 }}>
            {activeTab === 0 ? (
              <Box className="main-info">
                <Typography variant="h6" gutterBottom>
                  Activity Information
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Box className="info-grid" sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                  gap: 3,
                  mb: 3,
                }}>
                  <Box className="info-item" sx={{ gridColumn: { xs: '1 / -1' } }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Description:
                    </Typography>
                    <Typography variant="body1">
                      {activity.description || 'No description provided'}
                    </Typography>
                  </Box>

                  <Box className="info-item">
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Category:
                    </Typography>
                    <Chip
                      label={activity.activity_category ? activity.activity_category.replace(/_/g, ' ') : 'UNKNOWN'}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </Box>

                  <Box className="info-item">
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Start Date:
                    </Typography>
                    <Typography variant="body1">
                      {new Date(activity.start_date).toLocaleString()}
                    </Typography>
                  </Box>

                  <Box className="info-item">
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      End Date:
                    </Typography>
                    <Typography variant="body1">
                      {new Date(activity.end_date).toLocaleString()}
                    </Typography>
                  </Box>

                  <Box className="info-item">
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Venue:
                    </Typography>
                    <Typography variant="body1">
                      {activity.activity_venue || 'Not specified'}
                    </Typography>
                  </Box>

                  {activity.activity_schedules && activity.activity_schedules.length > 0 && (
                    <Box sx={{ gridColumn: { xs: '1 / -1' }, mt: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Schedule
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {activity.activity_schedules.map((schedule: ActivitySchedule, index: number) => {
                          const status = getScheduleStatus(schedule);
                          const isCurrent = status === 'IN_PROGRESS';

                          return (
                            <Paper
                              key={schedule.id || index}
                              elevation={isCurrent ? 3 : 1}
                              sx={{
                                p: 2,
                                borderLeft: `4px solid ${isCurrent ? theme.palette.primary.main : 'transparent'}`,
                                backgroundColor: isCurrent ? 'rgba(25, 118, 210, 0.04)' : 'background.paper',
                              }}
                            >
                              <Box display="flex" alignItems="flex-start" gap={2}>
                                <Box sx={{ color: getScheduleStatusColor(status), mt: 0.5 }}>
                                  <ScheduleIcon />
                                </Box>
                                <Box flexGrow={1}>
                                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Typography variant="subtitle1" fontWeight="medium">
                                      {schedule.activity_description || 'Session'}
                                    </Typography>
                                    <Chip
                                      label={status.replace('_', ' ')}
                                      size="small"
                                      sx={{
                                        backgroundColor: isCurrent ? 'primary.light' : 'action.selected',
                                        color: isCurrent ? 'primary.contrastText' : 'text.secondary',
                                        fontWeight: 'medium',
                                      }}
                                    />
                                  </Box>

                                  <Box display="flex" alignItems="center" gap={1} mb={1} color="text.secondary">
                                    <LocationIcon fontSize="small" />
                                    <Typography variant="body2">
                                      {schedule.location || 'Location not specified'}
                                    </Typography>
                                  </Box>

                                  <Box display="flex" flexWrap="wrap" gap={2} mt={1.5}>
                                    <Box>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        Start Time
                                      </Typography>
                                      <Typography variant="body2">
                                        {new Date(schedule.start_time).toLocaleString()}
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        End Time
                                      </Typography>
                                      <Typography variant="body2">
                                        {new Date(schedule.end_time).toLocaleString()}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Box>
                              </Box>
                            </Paper>
                          );
                        })}
                      </Box>
                    </Box>
                  )}

                  <Box className="info-item">
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Capacity:
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body1">
                        {activity.current_participants} / {activity.capacity_limit}
                      </Typography>
                      <Box flexGrow={1}>
                        <Box
                          sx={{
                            height: 8,
                            bgcolor: 'divider',
                            borderRadius: 2,
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              width: `${(activity.current_participants / activity.capacity_limit) * 100}%`,
                              height: '100%',
                              bgcolor: 'primary.main',
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box className="participants-section" sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <Select
                      value={filters.participationStatus}
                      onChange={(e: SelectChangeEvent<string>) =>
                        setFilters({ ...filters, participationStatus: e.target.value })
                      }
                      displayEmpty
                    >
                      <MenuItem value="">All Status</MenuItem>
                      {Object.values(ParticipationStatus).map((status) => (
                        <MenuItem key={status} value={status}>
                          {status.charAt(0) + status.slice(1).toLowerCase()}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    size="small"
                    placeholder="Search participants..."
                    value={filters.search}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                  />
                </Box>

                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        {/* <TableCell>Email</TableCell> */}
                        <TableCell>Student Code</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Contact</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <CircularProgress />
                          </TableCell>
                        </TableRow>
                      ) : participants.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            No participants found
                          </TableCell>
                        </TableRow>
                      ) : (
                        participants.map((participant) => (
                          <TableRow key={participant.id}>
                            <TableCell>{participant.participant_name}</TableCell>
                            <TableCell>{participant.identify_code}</TableCell>
                            <TableCell>{participant.participation_role}</TableCell>
                            <TableCell>
                              <Chip
                                label={participant.participation_status}
                                color={getStatusColor(participant.participation_status) as any}
                                size="small"
                              />
                            </TableCell>
                            {/* <TableCell>{participant.participation_role}</TableCell> */}
                            {/* <TableCell align="right">
                              {participant.participation_status === 'UNVERIFIED' && (
                                <>
                                  <Button
                                    size="small"
                                    color="success"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleVerify(participant.id);
                                    }}
                                  >
                                    <CheckIcon />
                                  </Button>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReject(participant.id);
                                    }}
                                  >
                                    <ClearIcon />
                                  </IconButton>
                                </>
                              )}
                            </TableCell> */}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box display="flex" justifyContent="center" mt={2}>
                  <Pagination
                    count={totalPages}
                    page={page + 1}
                    onChange={(e, value) => setPage(value - 1)}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityParticipantManagement;
