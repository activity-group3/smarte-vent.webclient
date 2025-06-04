import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Paper,
  Box,
  Divider,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Fade, // Import Fade
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { FilterAlt, Refresh, Timeline, CompareArrows, Feedback, Analytics, TrendingUp, Lightbulb } from "@mui/icons-material";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import activityStatisticsService from "../../services/activityStatisticsService";

const ActivityStatisticsModal = ({ open, onClose, statistics, loading, activityId }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [timeRangeStats, setTimeRangeStats] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [timeRangeLoading, setTimeRangeLoading] = useState(false);
  const [trendLoading, setTrendLoading] = useState(false);
  const [startDate, setStartDate] = useState(subMonths(new Date(), 3));
  const [endDate, setEndDate] = useState(new Date());

  // New state for advanced analysis features
  const [feedbackAnalysis, setFeedbackAnalysis] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [comparativeAnalysis, setComparativeAnalysis] = useState(null);
  const [comparativeLoading, setComparativeLoading] = useState(false);
  const [timeSeriesData, setTimeSeriesData] = useState(null);
  const [timeSeriesLoading, setTimeSeriesLoading] = useState(false);
  const [effectivenessMetrics, setEffectivenessMetrics] = useState(null);
  const [effectivenessLoading, setEffectivenessLoading] = useState(false);
  const [improvementRecommendations, setImprovementRecommendations] = useState(null);
  const [improvementLoading, setImprovementLoading] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(1000);
  const [estimatedValue, setEstimatedValue] = useState(2000);

  // Move useEffect hooks before any conditional returns
  useEffect(() => {
    if (open && activityId && activeTab === 1) {
      fetchTimeRangeData();
    }
  }, [open, activityId, activeTab]);

  useEffect(() => {
    if (open && activityId && activeTab === 2) {
      fetchParticipationTrend();
    }
  }, [open, activityId, activeTab]);

  // New useEffect hooks for advanced analysis features
  useEffect(() => {
    if (open && activityId && activeTab === 3) {
      fetchFeedbackAnalysis();
    }
  }, [open, activityId, activeTab]);

  useEffect(() => {
    if (open && activityId && activeTab === 4) {
      fetchComparativeAnalysis();
    }
  }, [open, activityId, activeTab]);

  useEffect(() => {
    if (open && activityId && activeTab === 5) {
      fetchTimeSeriesData();
    }
  }, [open, activityId, activeTab]);

  useEffect(() => {
    if (open && activityId && activeTab === 6) {
      fetchEffectivenessMetrics();
    }
  }, [open, activityId, activeTab]);

  useEffect(() => {
    if (open && activityId && activeTab === 7) {
      fetchImprovementRecommendations();
    }
  }, [open, activityId, activeTab]);

  // Now add the conditional return
  if (!statistics && !loading) return null;

  // Fetch feedback analysis
  const fetchFeedbackAnalysis = async () => {
    if (!activityId) return;

    setFeedbackLoading(true);
    try {
      const data = await activityStatisticsService.getFeedbackAnalysis(activityId);
      setFeedbackAnalysis(data);
    } catch (error) {
      console.error("Failed to fetch feedback analysis", error);
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Fetch comparative analysis
  const fetchComparativeAnalysis = async () => {
    if (!activityId) return;

    setComparativeLoading(true);
    try {
      const data = await activityStatisticsService.getComparativeAnalysis(activityId);
      setComparativeAnalysis(data);
    } catch (error) {
      console.error("Failed to fetch comparative analysis", error);
    } finally {
      setComparativeLoading(false);
    }
  };

  // Fetch time series data
  const fetchTimeSeriesData = async () => {
    if (!activityId) return;

    setTimeSeriesLoading(true);
    try {
      const data = await activityStatisticsService.getTimeSeriesData(activityId);
      setTimeSeriesData(data);
    } catch (error) {
      console.error("Failed to fetch time series data", error);
    } finally {
      setTimeSeriesLoading(false);
    }
  };

  // Fetch effectiveness metrics
  const fetchEffectivenessMetrics = async () => {
    if (!activityId) return;

    setEffectivenessLoading(true);
    try {
      const data = await activityStatisticsService.getEffectivenessMetrics(
        activityId,
        estimatedCost,
        estimatedValue
      );
      setEffectivenessMetrics(data);
    } catch (error) {
      console.error("Failed to fetch effectiveness metrics", error);
    } finally {
      setEffectivenessLoading(false);
    }
  };

  // Fetch improvement recommendations
  const fetchImprovementRecommendations = async () => {
    if (!activityId) return;

    setImprovementLoading(true);
    try {
      const data = await activityStatisticsService.getImprovementRecommendations(activityId);
      setImprovementRecommendations(data);
    } catch (error) {
      console.error("Failed to fetch improvement recommendations", error);
    } finally {
      setImprovementLoading(false);
    }
  };

  // Handle recalculating effectiveness metrics with new cost/value
  const handleRecalculateEffectiveness = () => {
    fetchEffectivenessMetrics();
  };

  // Fetch time range statistics
  const fetchTimeRangeData = async () => {
    if (!activityId) return;

    setTimeRangeLoading(true);
    try {
      const data = await activityStatisticsService.getActivityStatisticsByTimeRange(
        activityId,
        startDate,
        endDate
      );
      setTimeRangeStats(data);
    } catch (error) {
      console.error("Failed to fetch time range statistics", error);
    } finally {
      setTimeRangeLoading(false);
    }
  };

  // Fetch participation trend data
  const fetchParticipationTrend = async () => {
    if (!activityId) return;

    setTrendLoading(true);
    try {
      const data = await activityStatisticsService.getParticipationTrend(activityId);
      setTrendData(data);
    } catch (error) {
      console.error("Failed to fetch participation trend", error);
    } finally {
      setTrendLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Apply custom date range
  const handleApplyDateRange = () => {
    fetchTimeRangeData();
  };

  // Set predefined date ranges
  const handlePredefinedRange = (range) => {
    const now = new Date();
    let start;

    switch (range) {
      case 'last30days':
        start = new Date(now);
        start.setDate(now.getDate() - 30);
        break;
      case 'last3months':
        start = subMonths(now, 3);
        break;
      case 'last6months':
        start = subMonths(now, 6);
        break;
      case 'thisMonth':
        start = startOfMonth(now);
        break;
      default:
        start = subMonths(now, 3);
    }

    setStartDate(start);
    setEndDate(now);
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return format(new Date(timestamp * 1000), "MMM dd, yyyy hh:mm a");
  };

  // Convert participants by role object to array for charts
  const roleData = statistics?.participants_by_role
    ? Object.entries(statistics.participants_by_role).map(([key, value]) => ({
      name: key.replace(/_/g, " "),
      value,
    }))
    : [];

  // Convert participants by status object to array for charts
  const statusData = statistics?.participants_by_status
    ? Object.entries(statistics.participants_by_status).map(([key, value]) => ({
      name: key.replace(/_/g, " "),
      value,
    }))
    : [];

  // Rating distribution data
  const ratingData = statistics
    ? [
      { name: "High Rating", value: statistics.high_rating_count },
      { name: "Mid Rating", value: statistics.mid_rating_count },
      { name: "Low Rating", value: statistics.low_rating_count },
    ]
    : [];

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      TransitionComponent={Fade} // Add Fade transition
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle sx={{ pb: 0 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" component="div" fontWeight="bold">
              Activity Analysis
              {statistics && (
                <Typography variant="subtitle1" color="text.secondary">
                  {statistics.activity_name}
                </Typography>
              )}
            </Typography>
          </Box>
          <Box>
            <Button
              variant="outlined"
              size="small"
              onClick={onClose}
              sx={{ minWidth: 'auto', p: 1 }}
            >
              Close
            </Button>
          </Box>
        </Box>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mt: 2 }}
        >
          <Tab label="Overall Statistics" />
          <Tab label="Time Range Analysis" />
          <Tab label="Participation Trend" />
          <Tab icon={<Feedback fontSize="small" />} iconPosition="start" label="Feedback Analysis" />
          <Tab icon={<CompareArrows fontSize="small" />} iconPosition="start" label="Comparative" />
          <Tab icon={<Timeline fontSize="small" />} iconPosition="start" label="Time Series" />
          <Tab icon={<Analytics fontSize="small" />} iconPosition="start" label="Effectiveness" />
          <Tab icon={<Lightbulb fontSize="small" />} iconPosition="start" label="Recommendations" />
        </Tabs>
      </DialogTitle>

      <DialogContent dividers>
        {activeTab === 0 && loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="400px">
            <CircularProgress />
          </Box>
        ) : activeTab === 0 && statistics ? (
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      Category
                    </Typography>
                    <Chip
                      label={statistics.activity_category.replace(/_/g, " ")}
                      color="primary"
                      variant="outlined"
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={statistics.activity_status.replace(/_/g, " ")}
                      color="info"
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      Duration
                    </Typography>
                    <Typography variant="body1">
                      {statistics.duration_in_hours} hours
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Start Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(statistics.start_date)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      End Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(statistics.end_date)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Key Metrics */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Key Metrics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Registrations
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {statistics.total_registrations}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Confirmed Participants
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {statistics.confirmed_participants}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Actual Attendees
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {statistics.actual_attendees}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Average Rating
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {(statistics.average_rating || 0).toFixed(1)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Participation Rate
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {((statistics.participation_rate * 100) || 0).toFixed(1)}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Capacity Utilization
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {((statistics.capacity_utilization * 100) || 0).toFixed(1)}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Feedback Count
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {statistics.feedback_count}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Days Before Start
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {statistics.days_before_start}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Charts Section */}
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Participants by Role
                </Typography>
                <Box sx={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roleData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {roleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} participants`, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Participants by Status
                </Typography>
                <Box sx={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} participants`, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Feedback Rating Distribution
                </Typography>
                <Box sx={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={ratingData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8">
                        {ratingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            {/* Top Participants Table */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Top Participants
                </Typography>
                <TableContainer component={Paper} elevation={0} variant="outlined">
                  <Table sx={{ minWidth: 650 }} aria-label="top participants table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Score</TableCell>
                        <TableCell>Feedback</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {statistics.top_participants.map((participant) => (
                        <TableRow
                          key={participant.participant_id}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell component="th" scope="row">
                            {participant.participant_name}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={participant.role}
                              size="small"
                              color={participant.role === "CONTRIBUTOR" ? "success" : "primary"}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{(participant.score || 0).toFixed(1)}</TableCell>
                          <TableCell>{participant.feedback_description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        ) : activeTab === 1 ? (
          <Box sx={{ py: 2 }}>
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Time Range Analysis
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={5}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Box display="flex" gap={2}>
                      <DatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
                        sx={{ flex: 1 }}
                      />
                      <DatePicker
                        label="End Date"
                        value={endDate}
                        onChange={(newValue) => setEndDate(newValue)}
                        sx={{ flex: 1 }}
                      />
                    </Box>
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Box display="flex" gap={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handlePredefinedRange('last30days')}
                    >
                      Last 30 Days
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handlePredefinedRange('last3months')}
                    >
                      Last 3 Months
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handlePredefinedRange('thisMonth')}
                    >
                      This Month
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    variant="contained"
                    onClick={handleApplyDateRange}
                    startIcon={<FilterAlt />}
                    fullWidth
                  >
                    Apply Filter
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {timeRangeLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <CircularProgress />
              </Box>
            ) : timeRangeStats ? (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Time Range Metrics
                      <Typography variant="caption" display="block" color="text.secondary">
                        {format(startDate, 'MMM dd, yyyy')} - {format(endDate, 'MMM dd, yyyy')}
                      </Typography>
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Total Registrations
                          </Typography>
                          <Typography variant="h4" color="primary">
                            {timeRangeStats.total_registrations}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Confirmed Participants
                          </Typography>
                          <Typography variant="h4" color="primary">
                            {timeRangeStats.confirmed_participants}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Average Rating
                          </Typography>
                          <Typography variant="h4" color="primary">
                            {(timeRangeStats.average_rating || 0).toFixed(1)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Feedback Count
                          </Typography>
                          <Typography variant="h4" color="primary">
                            {timeRangeStats.feedback_count}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Rating Distribution
                    </Typography>
                    <Box sx={{ height: 250 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: "High Rating", value: timeRangeStats.high_rating_count },
                            { name: "Mid Rating", value: timeRangeStats.mid_rating_count },
                            { name: "Low Rating", value: timeRangeStats.low_rating_count },
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8884d8">
                            <Cell fill="#00C49F" />
                            <Cell fill="#FFBB28" />
                            <Cell fill="#FF8042" />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Top Participants
                    </Typography>
                    <TableContainer sx={{ maxHeight: 250 }}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Score</TableCell>
                            <TableCell>Role</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {timeRangeStats.top_participants.slice(0, 5).map((participant) => (
                            <TableRow key={participant.participant_id}>
                              <TableCell>{participant.participant_name}</TableCell>
                              <TableCell>{(participant.score || 0).toFixed(1)}</TableCell>
                              <TableCell>
                                <Chip
                                  label={participant.role}
                                  size="small"
                                  color={participant.role === "CONTRIBUTOR" ? "success" : "primary"}
                                  variant="outlined"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" p={5}>
                <Typography>No data available for selected time range</Typography>
              </Box>
            )}
          </Box>
        ) : activeTab === 2 ? (
          <Box sx={{ py: 2 }}>
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  Participation Trend Analysis
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Refresh />}
                  onClick={fetchParticipationTrend}
                >
                  Refresh Data
                </Button>
              </Box>
            </Paper>

            {trendLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <CircularProgress />
              </Box>
            ) : trendData ? (
              <Grid container spacing={3}>
                {/* Participation Stats */}
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Participation Statistics
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Total Registrations
                          </Typography>
                          <Typography variant="h4" color="primary">
                            {trendData.total_registrations}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Confirmed Participants
                          </Typography>
                          <Typography variant="h4" color="primary">
                            {trendData.confirmed_participants}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Actual Attendees
                          </Typography>
                          <Typography variant="h4" color="primary">
                            {trendData.actual_attendees}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Participation Rate
                          </Typography>
                          <Typography variant="h4" color="primary">
                            {(trendData.participation_rate * 100 || 0).toFixed(1)}%
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Role Distribution */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Participants by Role
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={Object.entries(trendData.participants_by_role).map(([key, value]) => ({
                              name: key.replace(/_/g, " "),
                              value,
                            }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            <Cell fill="#0088FE" />
                            <Cell fill="#00C49F" />
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} participants`, 'Count']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>

                {/* Status Distribution */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Participants by Status
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={Object.entries(trendData.participants_by_status).map(([key, value]) => ({
                              name: key.replace(/_/g, " "),
                              value,
                            }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            <Cell fill="#8884d8" />
                            <Cell fill="#82ca9d" />
                            <Cell fill="#FFBB28" />
                            <Cell fill="#FF8042" />
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} participants`, 'Count']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" p={5}>
                <Typography>No participation trend data available</Typography>
              </Box>
            )}
          </Box>
        ) : activeTab === 3 ? (
          <Box sx={{ py: 2 }}>
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  Feedback Analysis
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Refresh />}
                  onClick={fetchFeedbackAnalysis}
                >
                  Refresh Data
                </Button>
              </Box>
            </Paper>

            {feedbackLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <CircularProgress />
              </Box>
            ) : feedbackAnalysis ? (
              <Grid container spacing={3}>
                {/* Key Metrics */}
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Feedback Overview
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Average Rating
                          </Typography>
                          <Typography variant="h4" color="primary">
                            {(feedbackAnalysis.average_rating || 0).toFixed(1)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Feedback Count
                          </Typography>
                          <Typography variant="h4" color="primary">
                            {feedbackAnalysis.feedback_count}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            High Ratings
                          </Typography>
                          <Typography variant="h4" color="success.main">
                            {feedbackAnalysis.high_rating_count}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Low Ratings
                          </Typography>
                          <Typography variant="h4" color="error.main">
                            {feedbackAnalysis.low_rating_count}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Rating Distribution */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Rating Distribution
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: "High Rating", value: feedbackAnalysis.high_rating_count },
                            { name: "Mid Rating", value: feedbackAnalysis.mid_rating_count },
                            { name: "Low Rating", value: feedbackAnalysis.low_rating_count },
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8884d8">
                            <Cell fill="#00C49F" />
                            <Cell fill="#FFBB28" />
                            <Cell fill="#FF8042" />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>

                {/* Activity Status */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Activity Status
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2">Activity Status:</Typography>
                            <Chip
                              label={feedbackAnalysis.activity_status.replace(/_/g, " ")}
                              color="info"
                              size="small"
                            />
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2">Days Before Start:</Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {feedbackAnalysis.days_before_start}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2">Duration:</Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {feedbackAnalysis.duration_in_hours} hours
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2">Participation Rate:</Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {(feedbackAnalysis.participation_rate * 100 || 0).toFixed(1)}%
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2">Capacity Utilization:</Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {(feedbackAnalysis.capacity_utilization * 100 || 0).toFixed(1)}%
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Paper>
                </Grid>

                {/* Top Feedback */}
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Top Participant Feedback
                    </Typography>
                    <TableContainer sx={{ maxHeight: 350 }}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Participant</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Rating</TableCell>
                            <TableCell>Feedback</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {feedbackAnalysis.top_participants.map((participant) => (
                            <TableRow key={participant.participant_id}>
                              <TableCell>{participant.participant_name}</TableCell>
                              <TableCell>
                                <Chip
                                  label={participant.role}
                                  size="small"
                                  color={participant.role === "CONTRIBUTOR" ? "success" : "primary"}
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Box display="flex" alignItems="center">
                                  <Typography variant="body2" fontWeight="bold">
                                    {(participant.feedback_rating || 0).toFixed(1)}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>
                                  {participant.feedback_description}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" p={5}>
                <Typography>No feedback analysis data available</Typography>
              </Box>
            )}
          </Box>
        ) : activeTab === 4 ? (
          <Box sx={{ py: 2 }}>
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  Comparative Analysis
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Refresh />}
                  onClick={fetchComparativeAnalysis}
                >
                  Refresh Data
                </Button>
              </Box>
            </Paper>

            {comparativeLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <CircularProgress />
              </Box>
            ) : comparativeAnalysis ? (
              <Grid container spacing={3}>
                {/* Comparison Metrics */}
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Comparison with Category Average
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Average Rating vs Category
                          </Typography>
                          <Typography variant="h5" color={comparativeAnalysis.average_rating_vs_category_average > 0 ? "success.main" : "error.main"}>
                            {comparativeAnalysis.average_rating_vs_category_average > 0 ? "+" : ""}
                            {(comparativeAnalysis.average_rating_vs_category_average || 0).toFixed(1)}%
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Participation Rate vs Category
                          </Typography>
                          <Typography variant="h5" color={comparativeAnalysis.participation_rate_vs_category_average > 0 ? "success.main" : "error.main"}>
                            {comparativeAnalysis.participation_rate_vs_category_average > 0 ? "+" : ""}
                            {(comparativeAnalysis.participation_rate_vs_category_average || 0).toFixed(1)}%
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Cost per Participant vs Category
                          </Typography>
                          <Typography variant="h5" color={comparativeAnalysis.cost_per_participant_vs_category_average < 0 ? "success.main" : "error.main"}>
                            {comparativeAnalysis.cost_per_participant_vs_category_average > 0 ? "+" : ""}
                            { (parseFloat(comparativeAnalysis.cost_per_participant_vs_category_average) || 0).toFixed(1) }%
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Percentile Rankings */}
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Percentile Rankings
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Participation Percentile
                          </Typography>
                          <Box display="flex" alignItems="center">
                            <Typography variant="h5" color="primary" sx={{ mr: 1 }}>
                              {(comparativeAnalysis.participation_percentile || 0)}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              (better than {(comparativeAnalysis.participation_percentile || 0)}% of activities)
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Rating Percentile
                          </Typography>
                          <Box display="flex" alignItems="center">
                            <Typography variant="h5" color="primary" sx={{ mr: 1 }}>
                              {(comparativeAnalysis.rating_percentile || 0)}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              (better than {(comparativeAnalysis.rating_percentile || 0)}% of activities)
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Engagement Percentile
                          </Typography>
                          <Box display="flex" alignItems="center">
                            <Typography variant="h5" color="primary" sx={{ mr: 1 }}>
                              {(comparativeAnalysis.engagement_percentile || 0)}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              (better than {(comparativeAnalysis.engagement_percentile || 0)}% of activities)
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Similar Activities Comparison */}
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Similar Activities Comparison
                    </Typography>
                    <TableContainer sx={{ maxHeight: 350 }}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Activity</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Similarity</TableCell>
                            <TableCell>Participants</TableCell>
                            <TableCell>Avg. Rating</TableCell>
                            <TableCell>Rating Diff</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {comparativeAnalysis.similar_activities_comparison.map((activity) => (
                            <TableRow key={activity.activity_id}>
                              <TableCell>{activity.activity_name}</TableCell>
                              <TableCell>
                                <Chip
                                  label={activity.activity_category.replace(/_/g, " ")}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>{activity.similarity_score}%</TableCell>
                              <TableCell>{activity.participant_count}</TableCell>
                              <TableCell>{(activity.average_rating || 0).toFixed(1)}</TableCell>
                              <TableCell>
                                <Typography
                                  color={activity.average_rating_difference > 0 ? "success.main" : "error.main"}
                                  variant="body2"
                                  fontWeight="bold"
                                >
                                  {activity.average_rating_difference > 0 ? "+" : ""}
                                  {(activity.average_rating_difference || 0).toFixed(1)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" p={5}>
                <Typography>No comparative analysis data available</Typography>
              </Box>
            )}
          </Box>
        ) : activeTab === 5 ? (
          <Box sx={{ py: 2 }}>
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  Time Series Analysis
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Refresh />}
                  onClick={fetchTimeSeriesData}
                >
                  Refresh Data
                </Button>
              </Box>
            </Paper>

            {timeSeriesLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <CircularProgress />
              </Box>
            ) : timeSeriesData ? (
              <Grid container spacing={3}>
                {/* Registration Time Series */}
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Registration Pattern
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={Object.entries(timeSeriesData.registration_time_series).map(([date, count]) => ({
                            date,
                            registrations: count
                          }))}
                          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="registrations" fill="#8884d8" name="Registrations" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>

                {/* Feedback Time Series */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Feedback Ratings Over Time
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={Object.entries(timeSeriesData.feedback_time_series).map(([date, rating]) => ({
                            date,
                            rating
                          }))}
                          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 10]} />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="rating" stroke="#82ca9d" name="Average Rating" />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>

                {/* Engagement Time Series */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Engagement Levels Over Time
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={Object.entries(timeSeriesData.engagement_time_series).map(([date, level]) => ({
                            date,
                            engagement: level
                          }))}
                          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 1]} />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="engagement" stroke="#8884d8" name="Engagement Level" />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>

                {/* Social Interaction Time Series */}
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Social Interactions Over Time
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={Object.entries(timeSeriesData.social_interaction_time_series).map(([date, count]) => ({
                            date,
                            interactions: count
                          }))}
                          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="interactions" fill="#82ca9d" name="Social Interactions" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>

                {/* Peak Registration Times */}
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Registration Time Insights
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom>
                          Peak Registration Time Slots
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {timeSeriesData.peak_registration_time_slots.map((slot, index) => (
                            <Chip
                              key={index}
                              label={slot}
                              color="primary"
                              variant="outlined"
                              size="small"
                            />
                          ))}
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom>
                          Time to Capacity
                        </Typography>
                        {timeSeriesData.time_to_capacity_hours ? (
                          <>
                            <Typography variant="body1">
                              {(timeSeriesData.time_to_capacity_hours || 0)} hours
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {(timeSeriesData.time_to_capacity_percent_of_average || 0) > 100 ? 'Slower' : 'Faster'} than average by {Math.abs(100 - (timeSeriesData.time_to_capacity_percent_of_average || 0)).toFixed(0)}%
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Capacity not reached yet
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" p={5}>
                <Typography>No time series data available</Typography>
              </Box>
            )}
          </Box>
        ) : activeTab === 6 ? (
          <Box sx={{ py: 2 }}>
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  Effectiveness Metrics
                </Typography>
                <Box display="flex" gap={2}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Refresh />}
                    onClick={fetchEffectivenessMetrics}
                  >
                    Refresh Data
                  </Button>
                </Box>
              </Box>
            </Paper>

            {/* Cost and Value Inputs */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Estimated Cost and Value
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={5}>
                  <TextField
                    label="Estimated Cost"
                    type="number"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(parseInt(e.target.value, 10) || 0)}
                    InputProps={{
                      startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <TextField
                    label="Estimated Value"
                    type="number"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(parseInt(e.target.value, 10) || 0)}
                    InputProps={{
                      startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>,
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    variant="contained"
                    onClick={handleRecalculateEffectiveness}
                    fullWidth
                  >
                    Calculate
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {effectivenessLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <CircularProgress />
              </Box>
            ) : effectivenessMetrics ? (
              <Grid container spacing={3}>
                {/* ROI Metrics */}
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Return on Investment
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Return on Investment
                          </Typography>
                          <Typography variant="h4" color={effectivenessMetrics.return_on_investment > 0 ? "success.main" : "error.main"}>
                            {(effectivenessMetrics.return_on_investment || 0)}%
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Cost per Participant
                          </Typography>
                          <Typography variant="h4" color="primary">
                            ${ (parseFloat(effectivenessMetrics.cost_per_participant) || 0).toFixed(2) }
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Value per Participant
                          </Typography>
                          <Typography variant="h4" color="primary">
                            ${(effectivenessMetrics.value_per_participant || 0).toFixed(2)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Percentile Rankings */}
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Performance Rankings
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Participation Percentile
                          </Typography>
                          <Box display="flex" alignItems="center">
                            <Typography variant="h5" color="primary" sx={{ mr: 1 }}>
                              {(effectivenessMetrics.participation_percentile || 0)}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              (better than {(effectivenessMetrics.participation_percentile || 0)}% of activities)
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Rating Percentile
                          </Typography>
                          <Box display="flex" alignItems="center">
                            <Typography variant="h5" color="primary" sx={{ mr: 1 }}>
                              {(effectivenessMetrics.rating_percentile || 0)}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              (better than {(effectivenessMetrics.rating_percentile || 0)}% of activities)
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Engagement Percentile
                          </Typography>
                          <Box display="flex" alignItems="center">
                            <Typography variant="h5" color="primary" sx={{ mr: 1 }}>
                              {(effectivenessMetrics.engagement_percentile || 0)}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              (better than {(effectivenessMetrics.engagement_percentile || 0)}% of activities)
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Comparison Metrics */}
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Comparison with Category Average
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Average Rating vs Category
                          </Typography>
                          <Typography variant="h5" color={effectivenessMetrics.average_rating_vs_category_average > 0 ? "success.main" : "error.main"}>
                            {effectivenessMetrics.average_rating_vs_category_average > 0 ? "+" : ""}
                            {(effectivenessMetrics.average_rating_vs_category_average || 0).toFixed(1)}%
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Participation Rate vs Category
                          </Typography>
                          <Typography variant="h5" color={effectivenessMetrics.participation_rate_vs_category_average > 0 ? "success.main" : "error.main"}>
                            {effectivenessMetrics.participation_rate_vs_category_average > 0 ? "+" : ""}
                            {(effectivenessMetrics.participation_rate_vs_category_average || 0).toFixed(1)}%
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Cost per Participant vs Category
                          </Typography>
                          <Typography variant="h5" color={effectivenessMetrics.cost_per_participant_vs_category_average < 0 ? "success.main" : "error.main"}>
                            {effectivenessMetrics.cost_per_participant_vs_category_average > 0 ? "+" : ""}
                            { (parseFloat(effectivenessMetrics.cost_per_participant_vs_category_average) || 0).toFixed(1) }%
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" p={5}>
                <Typography>No effectiveness metrics data available</Typography>
              </Box>
            )}
          </Box>
        ) : activeTab === 7 ? (
          <Box sx={{ py: 2 }}>
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  Improvement Recommendations
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Refresh />}
                  onClick={fetchImprovementRecommendations}
                >
                  Refresh Data
                </Button>
              </Box>
            </Paper>

            {improvementLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <CircularProgress />
              </Box>
            ) : improvementRecommendations ? (
              <Grid container spacing={3}>
                {/* Performance Metrics */}
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Performance Overview
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Average Rating vs Category
                          </Typography>
                          <Typography variant="h5" color={improvementRecommendations.average_rating_vs_category_average > 0 ? "success.main" : "error.main"}>
                            {improvementRecommendations.average_rating_vs_category_average > 0 ? "+" : ""}
                            {(improvementRecommendations.average_rating_vs_category_average || 0).toFixed(1)}%
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Participation Rate vs Category
                          </Typography>
                          <Typography variant="h5" color={improvementRecommendations.participation_rate_vs_category_average > 0 ? "success.main" : "error.main"}>
                            {improvementRecommendations.participation_rate_vs_category_average > 0 ? "+" : ""}
                            {(improvementRecommendations.participation_rate_vs_category_average || 0).toFixed(1)}%
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Cost per Participant
                          </Typography>
                          <Typography variant="h5" color="primary">
                            ${ (parseFloat(improvementRecommendations.cost_per_participant) || 0).toFixed(2) }
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Percentile Rankings */}
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Performance Rankings
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', mb: 3 }}>
                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Participation Percentile
                        </Typography>
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                          <CircularProgress
                            variant="determinate"
                            value={improvementRecommendations.participation_percentile}
                            size={80}
                            thickness={4}
                            sx={{ color: theme => theme.palette.primary.main }}
                          />
                          <Box
                            sx={{
                              top: 0,
                              left: 0,
                              bottom: 0,
                              right: 0,
                              position: 'absolute',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography variant="caption" component="div" color="text.secondary">
                              {improvementRecommendations.participation_percentile}%
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Rating Percentile
                        </Typography>
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                          <CircularProgress
                            variant="determinate"
                            value={improvementRecommendations.rating_percentile}
                            size={80}
                            thickness={4}
                            sx={{ color: theme => theme.palette.success.main }}
                          />
                          <Box
                            sx={{
                              top: 0,
                              left: 0,
                              bottom: 0,
                              right: 0,
                              position: 'absolute',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography variant="caption" component="div" color="text.secondary">
                              {improvementRecommendations.rating_percentile}%
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box sx={{ textAlign: 'center', p: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Engagement Percentile
                        </Typography>
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                          <CircularProgress
                            variant="determinate"
                            value={improvementRecommendations.engagement_percentile}
                            size={80}
                            thickness={4}
                            sx={{ color: theme => theme.palette.info.main }}
                          />
                          <Box
                            sx={{
                              top: 0,
                              left: 0,
                              bottom: 0,
                              right: 0,
                              position: 'absolute',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography variant="caption" component="div" color="text.secondary">
                              {improvementRecommendations.engagement_percentile}%
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                {/* Similar Activities Comparison */}
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Similar Activities
                    </Typography>
                    <TableContainer sx={{ maxHeight: 300 }}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Activity</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Similarity</TableCell>
                            <TableCell>Participants</TableCell>
                            <TableCell>Avg. Rating</TableCell>
                            <TableCell>Rating Diff</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {improvementRecommendations.similar_activities_comparison.map((activity) => (
                            <TableRow key={activity.activity_id}>
                              <TableCell>{activity.activity_name}</TableCell>
                              <TableCell>
                                <Chip
                                  label={activity.activity_category.replace(/_/g, " ")}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>{activity.similarity_score}%</TableCell>
                              <TableCell>{activity.participant_count}</TableCell>
                              <TableCell>{((activity.average_rating || 0)).toFixed(1)}</TableCell>
                              <TableCell>
                                <Typography
                                  color={activity.average_rating_difference > 0 ? "success.main" : "error.main"}
                                  variant="body2"
                                  fontWeight="bold"
                                >
                                  {activity.average_rating_difference > 0 ? "+" : ""}
                                  {((activity.average_rating_difference || 0)).toFixed(1)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>

                {/* Improvement Opportunities */}
                {improvementRecommendations.improvement_opportunities && (
                  <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Improvement Opportunities
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body1">
                          {improvementRecommendations.improvement_opportunities}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" p={5}>
                <Typography>No improvement recommendations data available</Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Typography>No data available</Typography>
        )}
      </DialogContent>

      {/* Removed dialog actions since close button is now in the title */}
    </Dialog>
  );
};

export default ActivityStatisticsModal;
