import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  FormControl,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Pagination,
  InputLabel,
  TextField,
  Button,
  Collapse,
  Grid,
  Tooltip,
} from "@mui/material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Analytics as AnalyticsIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import "tailwindcss/tailwind.css";
import {
  FaSearch,
  FaFilter,
  FaCalendar,
  FaCalendarCheck,
  FaCheck,
  FaChartBar,
} from "react-icons/fa";
import { account } from "@/Context/user";
import ActivityUpdateForm from '@/components/ActivityUpdateForm';
import ActivityStatisticsModal from '@/components/ActivityStatisticsModal';
import activityStatisticsService from '@/services/activityStatisticsService';

const ActivityStatus = {
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  PUBLISHED: "PUBLISHED",
  CANCELLED: "CANCELLED",
  PENDING: "PENDING",
};

const ActivityCategory = {
  STUDENT_ORGANIZATION: "STUDENT_ORGANIZATION",
  UNIVERSITY: "UNIVERSITY",
  THIRD_PARTY: "THIRD_PARTY"
};

const SortFields = {
  START_DATE: "startDate",
  END_DATE: "endDate",
  ACTIVITY_NAME: "activityName",
  ACTIVITY_STATUS: "activityStatus",
  ACTIVITY_CATEGORY: "activityCategory",
  CREATED_DATE: "createdDate", // Added createdDate
};


const OrganizationActivityManagement = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    status: ActivityStatus.PUBLISHED, // Default to PUBLISHED
    category: ActivityCategory.UNIVERSITY,
    startDateFrom: null,
    startDateTo: null,
  });

  const [sorting, setSorting] = useState({
    field: SortFields.START_DATE,
    direction: "desc",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showStatisticsModal, setShowStatisticsModal] = useState(false);
  const [activityStatistics, setActivityStatistics] = useState(null);
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  const [selectedStatisticsActivityId, setSelectedStatisticsActivityId] = useState(null);

  const handleSortChange = (field) => {
    setSorting((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    setPage(0);
  };

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem("access_token");
      let queryString = `page=${page}&size=20&sort=${sorting.field},${sorting.direction}`;

      if (filters.status) {
        queryString += `&activity_status=${filters.status}`;
      }
      if (filters.category) {
        queryString += `&activity_category=${filters.category}`;
      }
      if (filters.startDateFrom) {
        queryString += `&startDateFrom=${filters.startDateFrom.toISOString()}`;
      }
      if (filters.startDateTo) {
        queryString += `&startDateTo=${filters.startDateTo.toISOString()}`;
      }

      const response = await fetch(
        `http://localhost:8080/activities/search?${queryString}&organizationId=${account.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      // Assuming the top-level response is the actual data object as per the example
      // If the response is { "data": { ..., "results": ... }, "status_code": 200 }
      // then data.data.results and data.data.total_pages would be correct.
      // If the response is { "results": ..., "total_pages": ..., "status_code": 200 }
      // then data.results and data.total_pages would be correct.
      // Based on the provided example, the structure is: { "data": { "results": [], "total_pages": N }, "status_code": 200 }
      if (data.status_code === 200 && data.data) {
        setActivities(data.data.results); 
        setTotalPages(data.data.total_pages);
      } else if (data.results && typeof data.total_pages !== 'undefined') {
        // Fallback for a flatter structure if status_code is not the primary check
        // This case assumes the response might be directly { results: [], total_pages: N }
        // However, the provided example clearly has a nested 'data' object and a 'status_code'.
        // The primary logic should stick to the provided example.
        console.warn('API response structure might have changed, attempting to parse flatter structure. This is unexpected based on the example.');
        setActivities(data.results);
        setTotalPages(data.total_pages);
      } else {
        console.error("Error fetching activities or unexpected response structure:", data.message || data);
        setActivities([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [page, filters, sorting]);

  const handlePageChange = (event, value) => {
    setPage(value - 1);
  };

  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    setPage(0);
  };

  const handleEdit = async (activityId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8080/activities/${activityId}`,
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
        // Set the full activity data with schedules
        setSelectedActivity(data.data);
        setShowUpdateForm(true);
      } else {
        console.error("Error fetching activity details:", data.message);
      }
    } catch (error) {
      console.error("Error fetching activity details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSuccess = async (updatedActivity) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8080/activities/update", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedActivity),
      });

      const data = await response.json();
      if (data.status_code === 200) {
        // Close the form and refresh the activity list
        setShowUpdateForm(false);
        setSelectedActivity(null);
        fetchActivities();
      } else {
        console.error("Error updating activity:", data.message);
      }
    } catch (error) {
      console.error("Error updating activity:", error);
    }
  };

  const handleUpdateCancel = () => {
    setShowUpdateForm(false);
    setSelectedActivity(null);
  };

  const handleRemove = async (activityId) => {
    if (window.confirm("Are you sure you want to remove this activity?")) {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(
          `http://localhost:8080/activities/${activityId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          setActivities(
            activities.filter((activity) => activity.id !== activityId)
          );
        }
      } catch (error) {
        console.error("Error removing activity:", error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case ActivityStatus.PENDING:
        return "warning"; 
      case ActivityStatus.PUBLISHED:
        return "info"; 
      case ActivityStatus.IN_PROGRESS:
        return "primary";
      case ActivityStatus.COMPLETED:
        return "success";
      case ActivityStatus.CANCELLED:
        return "error";
      default:
        return "default";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "THIRD_PARTY":
        return "secondary";
      case "UNIVERSITY":
        return "primary";
      case "STUDENT_ORGANIZATION":
        return "success";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'; // Handle cases where date might be null or undefined
    if (!dateString) return "";
    return new Date(dateString).toLocaleString();
  };

  const handleRowClick = (activityId) => {
    navigate(`/organization/activities/${activityId}`);
  };

  // Handle showing activity statistics
  const handleShowStatistics = async (activityId, event) => {
    event.stopPropagation(); // Prevent row click event
    setStatisticsLoading(true);
    setShowStatisticsModal(true);
    setSelectedStatisticsActivityId(activityId);

    try {
      const statistics = await activityStatisticsService.getActivityStatistics(activityId);
      setActivityStatistics(statistics);
    } catch (error) {
      console.error("Error fetching activity statistics:", error);
    } finally {
      setStatisticsLoading(false);
    }
  };

  // Handle closing statistics modal
  const handleCloseStatistics = () => {
    setShowStatisticsModal(false);
    setSelectedStatisticsActivityId(null);
    setActivityStatistics(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="p-6 md:p-10">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Activity Management
              </h1>
            </div>
          </div>
        </header>
        <Box className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
          {showUpdateForm ? (
            <>
              <Typography variant="h5" className="mb-6">
                Update Activity
              </Typography>
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6">

                <ActivityUpdateForm
                  activity={selectedActivity}
                  onSubmit={handleUpdateSuccess}
                  onCancel={handleUpdateCancel}
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl p-6 text-white shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Total Activities</h3>
                    <div className="bg-white/20 p-3 rounded-full">
                      <FaCalendar className="text-white text-xl" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold">{activities.length}</p>
                </div>

                <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Active</h3>
                    <div className="bg-white/20 p-3 rounded-full">
                      <FaCalendarCheck className="text-white text-xl" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold">
                    {
                      activities.filter((a) => a.activity_status === "IN_PROGRESS")
                        .length
                    }
                  </p>
                </div>

                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl p-6 text-white shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Completed</h3>
                    <div className="bg-white/20 p-3 rounded-full">
                      <FaCheck className="text-white text-xl" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold">
                    {
                      activities.filter((a) => a.activity_status === "COMPLETED")
                        .length
                    }
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                  <div className=" bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-lg hover:scale-[1.01] transition-all duration-300 flex-1">
                    <TextField
                      fullWidth
                      label="Search Activity Name"
                      variant="outlined"
                      size="medium"
                      className="bg-white dark:bg-slate-700 rounded-lg"
                      InputProps={{
                        startAdornment: <FaSearch className="mr-2 text-gray-400" />,
                      }}
                    />
                  </div>

                  <Button
                    variant="contained"
                    startIcon={<FaFilter />}
                    onClick={() => setShowFilters(!showFilters)}
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 transition-all duration-500"
                  >
                    {showFilters ? "Hide Filters" : "Show Filters"}
                  </Button>
                </div>

                <Collapse in={showFilters}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <div className=" bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-lg hover:scale-[1.01] transition-all duration-300">
                        <FormControl
                          fullWidth
                          className="bg-white dark:bg-slate-700 rounded-lg"
                        >
                          <InputLabel>Category</InputLabel>
                          <Select
                            value={filters.category}
                            onChange={e => handleFilterChange(e.target.value)}
                            label="Category"
                          >
                            <MenuItem value="">All Categories</MenuItem>
                            {Object.values(ActivityCategory).map((category) => (
                              <MenuItem key={category} value={category}>
                                {category.replace(/_/g, " ")}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <div className=" bg-gradient-to-r from-green-500 via-teal-500 to-cyan-500 rounded-lg hover:scale-[1.01] transition-transform">
                        <FormControl
                          fullWidth
                          className="bg-white dark:bg-slate-700 rounded-lg"
                        >
                          <InputLabel>Status</InputLabel>
                          <Select
                            value={filters.status}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            label="Status"
                          >
                            <MenuItem value=""><em>All Statuses</em></MenuItem>
                            <MenuItem value={ActivityStatus.PENDING}>Pending</MenuItem>
                            <MenuItem value={ActivityStatus.PUBLISHED}>Published</MenuItem>
                            <MenuItem value={ActivityStatus.IN_PROGRESS}>In Progress</MenuItem>
                            <MenuItem value={ActivityStatus.COMPLETED}>Completed</MenuItem>
                            <MenuItem value={ActivityStatus.CANCELLED}>Cancelled</MenuItem>
                          </Select>
                        </FormControl>
                      </div>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <div className=" bg-gradient-to-r from-green-500 via-teal-500 to-cyan-500 rounded-lg hover:scale-[1.01] transition-transform">
                        <FormControl
                          fullWidth
                          className="bg-white dark:bg-slate-700 rounded-lg"
                        >
                          <InputLabel>Sort By</InputLabel>
                          <Select
                            value={sorting.field}
                            onChange={(e) => handleSortChange(e.target.value)}
                            label="Sort By"
                          >
                            <MenuItem value={SortFields.START_DATE}>
                              Sort by Start Date
                            </MenuItem>
                            <MenuItem value={SortFields.END_DATE}>
                              Sort by End Date
                            </MenuItem>
                            <MenuItem value={SortFields.ACTIVITY_NAME}>
                              Sort by Name
                            </MenuItem>
                            <MenuItem value={SortFields.ACTIVITY_STATUS}>
                              Sort by Status
                            </MenuItem>
                            <MenuItem value={SortFields.ACTIVITY_CATEGORY}>
                              Sort by Category
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </div>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <div className=" animate-gradient-x bg-[length:200%_200%] bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-lg hover:scale-[1.01] transition-all duration-300">
                        <Button
                          fullWidth
                          onClick={() => handleSortChange(sorting.field)}
                          className="bg-white dark:bg-slate-700 h-[56px] rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600"
                        >
                          {sorting.direction === "asc"
                            ? "↑ Ascending"
                            : "↓ Descending"}
                        </Button>
                      </div>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <div className="relative p-[3px] bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 rounded-lg hover:scale-[1.01] transition-transform">
                        <DateTimePicker
                          label="Start Date From"
                          value={filters.startDateFrom}
                          onChange={(date) =>
                            setFilters((prev) => ({
                              ...prev,
                              startDateFrom: date,
                            }))
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              className="bg-white dark:bg-slate-700 rounded-lg"
                            />
                          )}
                        />
                      </div>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <div className="relative p-[3px] bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-lg hover:scale-[1.01] transition-transform">
                        <DateTimePicker
                          label="Start Date To"
                          value={filters.startDateTo}
                          onChange={(date) =>
                            setFilters((prev) => ({
                              ...prev,
                              startDateTo: date,
                            }))
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              className="bg-white dark:bg-slate-700 rounded-lg"
                            />
                          )}
                        />
                      </div>
                    </Grid>
                  </Grid>
                </Collapse>
              </div>

              <TableContainer
                component={Paper}
                className="shadow-lg rounded-2xl overflow-hidden bg-white dark:bg-slate-800"
              >
                <Table>
                  <TableHead>
                    <TableRow className="bg-blue-600">
                      <TableCell className="text-white font-semibold">ID</TableCell>
                      <TableCell 
                        className="text-white font-semibold cursor-pointer"
                        onClick={() => handleSortChange(SortFields.ACTIVITY_NAME)}
                      >
                        Name
                        {sorting.field === SortFields.ACTIVITY_NAME && (
                          <span className="ml-1">{sorting.direction === "asc" ? "▲" : "▼"}</span>
                        )}
                      </TableCell>
                      <TableCell 
                        className="text-white font-semibold cursor-pointer"
                        onClick={() => handleSortChange(SortFields.CREATED_DATE)}
                      >
                        Created Date
                        {sorting.field === SortFields.CREATED_DATE && (
                          <span className="ml-1">{sorting.direction === "asc" ? "▲" : "▼"}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-white font-semibold">
                        Category
                      </TableCell>
                      <TableCell className="text-white font-semibold">
                        Venue
                      </TableCell>
                      <TableCell className="text-white font-semibold">
                        Start Date
                      </TableCell>
                      <TableCell className="text-white font-semibold">
                        End Date
                      </TableCell>
                      <TableCell className="text-white font-semibold">
                        Status
                      </TableCell>
                      <TableCell className="text-white font-semibold">
                        Capacity
                      </TableCell>
                      <TableCell className="text-white font-semibold">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activities.map((activity) => (
                      <TableRow
                        key={activity.id}
                        onClick={() => handleRowClick(activity.id)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <TableCell className="text-gray-700">
                          {activity.id}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {activity.activity_name}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {formatDate(activity.created_date)} 
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={activity.activity_category.replace(/_/g, " ")}
                            color={getCategoryColor(activity.activity_category)}
                            variant="outlined"
                            className="font-medium"
                          />
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {activity.activity_venue}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {formatDate(activity.start_date)}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {formatDate(activity.end_date)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={activity.activity_status.replace(/_/g, " ")}
                            color={getStatusColor(activity.activity_status)}
                            className="font-medium"
                          />
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {activity.current_participants}/{activity.capacity_limit}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Analyze Activity">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={(e) => handleShowStatistics(activity.id, e)}
                              className="mr-2 hover:bg-blue-50"
                            >
                              <AnalyticsIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Activity">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(activity.id);
                              }}
                              className="mr-2 hover:bg-blue-100"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Activity">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(activity.id);
                              }}
                              className="hover:bg-red-100"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box className="mt-6 flex justify-center">
                <Pagination
                  count={totalPages}
                  page={page + 1}
                  onChange={handlePageChange}
                  color="primary"
                  className="bg-white shadow-sm rounded-lg p-2"
                />
              </Box>
            </>
          )}
        </Box>
      </div>

      {/* {showUpdateForm && selectedActivity && (
        <ActivityUpdateForm
          activity={selectedActivity}
          onCancel={handleUpdateCancel}
          onSuccess={handleUpdateSuccess}
        />
      )} */}

      {/* Activity Statistics Modal */}
      <ActivityStatisticsModal
        open={showStatisticsModal}
        onClose={handleCloseStatistics}
        statistics={activityStatistics}
        loading={statisticsLoading}
        activityId={selectedStatisticsActivityId}
      />
    </LocalizationProvider>
  );
};

// Add this CSS animation class to your global styles or tailwind config
const styles = `
@keyframes gradient-x {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.animate-gradient-x {
  animation: gradient-x 3s ease infinite;
}
`;

export default OrganizationActivityManagement;
