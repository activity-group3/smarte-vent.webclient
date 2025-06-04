"use client";

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  FaSignOutAlt,
  FaCalendar,
  FaCalendarTimes,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaSearch,
  FaFilter,
  FaChartLine,
  FaBell,
} from "react-icons/fa";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  IconButton,
  Collapse,
  Button,
  Pagination,
  Box,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1, // 1-based for UI consistency
    totalPages: 1,
    size: 6,
  });

  const [sort, setSort] = useState({
    field: "startDate",
    direction: "desc",
  });

  const pageSizeOptions = [6, 10, 15, 20];
  const ACTIVITY_CATEGORIES = ["THIRD_PARTY", "UNIVERSITY", "STUDENT_ORGANIZATION"];

  const ACTIVITY_STATUSES = [
    "PENDING",
    "PUBLISHED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
  ];

  const [searchParams, setSearchParams] = useState({
    activityName: "",
    activityCategory: "",
    status: "",
    organizationName: "",
    startDateFrom: null,
    startDateTo: null,
    endDateFrom: null,
    endDateTo: null,
    minAttendanceScoreUnit: "",
    maxAttendanceScoreUnit: "",
    minCapacity: "",
    maxCapacity: "",
    activityVenue: "",
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/auth/login");
      return;
    }
    setUser(JSON.parse(userData));
    fetchActivities(); // Reads page and size from state
  }, [
    navigate,
    pagination.page, // Updated dependency
    pagination.size, // Updated dependency
    sort,
    searchParams,
  ]);

  const handleSearchParamChange = (param) => (event) => {
    setSearchParams((prev) => ({
      ...prev,
      [param]: event.target.value,
    }));
  };

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem("access_token");

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: (pagination.page - 1).toString(), // API expects 0-based page
        size: pagination.size.toString(),
        sort: `${sort.field},${sort.direction}`,
      });

      // Add search parameters to query
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== "" && value !== null) {
          if (value instanceof Date) {
            queryParams.append(key, value.toISOString());
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const response = await fetch(
        `http://localhost:8080/activities/search?${queryParams.toString()}&isApproved=true`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      console.log('API Response:', data); // Debug log
      
      if (data.status_code === 200 && data.data) {
        // Transform response data from snake_case to camelCase
        const transformedActivities = data.data.results?.map((activity) => ({
          id: activity.id,
          activityName: activity.activity_name,
          description: activity.description,
          startDate: activity.start_date,
          endDate: activity.end_date,
          activityVenue: activity.activity_venue,
          activityStatus: activity.activity_status,
          activityCategory: activity.activity_category,
          current_participants: activity.current_participants,
          capacity_limit: activity.capacity_limit,
        })) || [];
        
        setActivities(transformedActivities);
        setPagination(prev => ({
          ...prev,
          totalPages: data.data.total_pages || 1,
        }));
      } else {
        console.error('Error in response:', data);
        setError(data.message || "Failed to fetch activities");
        setActivities([]);
        setPagination(prev => ({ ...prev, totalPages: 1 }));
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/auth/login");
  };

  const handlePageChange = (event, value) => {
    setPagination((prev) => ({
      ...prev,
      page: value, // MUI Pagination provides 1-based value
    }));
  };

  const handleSortChange = (event) => {
    const [field, direction] = event.target.value.split(",");
    setSort({ field, direction });
  };

  const handlePageSizeChange = (event) => {
    const newSize = Number(event.target.value);
    setPagination((prev) => ({
      ...prev,
      size: newSize,
      page: 1, // Reset to first page (1-based)
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

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "border-orange-500 text-orange-500 bg-orange-50 dark:bg-orange-900 dark:text-orange-300";
      case "PUBLISHED":
        return "border-cyan-500 text-cyan-500 bg-cyan-50 dark:bg-cyan-900 dark:text-cyan-300";
      case "IN_PROGRESS":
        return "border-yellow-500 text-yellow-500 bg-yellow-50 dark:bg-yellow-900 dark:text-yellow-300";
      case "COMPLETED":
        return "border-green-500 text-green-500 bg-green-50 dark:bg-green-900 dark:text-green-300";
      case "CANCELLED":
        return "border-red-500 text-red-500 bg-red-50 dark:bg-red-900 dark:text-red-300";
      default:
        return "border-gray-500 text-gray-500 bg-gray-50 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getCategoryStyle = (category) => {
    switch (category) {
      case "THIRD_PARTY":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "UNIVERSITY":
        return "bg-cyan-100 text-cyan-800 border-cyan-300";
      case "STUDENT_ORGANIZATION":
        return "bg-pink-100 text-pink-800 border-pink-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const handleActivityClick = (id) => {
    navigate(`/activities/${id}`);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="p-6 md:p-10">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Student Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Welcome to your dashboard, {user?.name || "My Friend !"}
              </p>
            </div>

          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl p-6 text-white shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Active Activities</h3>
              <div className="bg-white/20 p-3 rounded-full">
                <FaCalendar className="text-white text-xl" />
              </div>
            </div>
            <p className="text-4xl font-bold">5</p>
            <p className="text-white/70 text-sm mt-2">+2 from last week</p>
          </div>

          <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Completed</h3>
              <div className="bg-white/20 p-3 rounded-full">
                <FaCalendarTimes className="text-white text-xl" />
              </div>
            </div>
            <p className="text-4xl font-bold">12</p>
            <p className="text-white/70 text-sm mt-2">+5 from last month</p>
          </div>

          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl p-6 text-white shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Achievements</h3>
              <div className="bg-white/20 p-3 rounded-full">
                <FaChartLine className="text-white text-xl" />
              </div>
            </div>
            <p className="text-4xl font-bold">8</p>
            <p className="text-white/70 text-sm mt-2">+3 from last month</p>
          </div>
        </div>

        <Paper className="mb-6 p-4 bg-gray-50 dark:bg-slate-700 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <Grid item xs={12} sm={6}>
              <div className="bg-gradient-to-r from-green-500 via-teal-500 to-cyan-500 rounded-lg hover:scale-[1.01] transition-transform">
                <TextField
                  label="Search Activity Name"
                  variant="outlined"
                  size="small"
                  value={searchParams.activityName}
                  onChange={handleSearchParamChange("activityName")}
                  className="rounded-lg bg-white dark:bg-slate-700 hover:shadow-lg transition-shadow"
                  InputProps={{
                    startAdornment: (
                      <FaSearch className="mr-2 text-gray-400" />
                    ),
                  }}
                />
              </div>
            </Grid>
            <Button
              variant="outlined"
              startIcon={<FaFilter />}
              onClick={() => setShowFilters(!showFilters)}
              className="w-full md:w-auto"
              size="small"
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>

          <Collapse in={showFilters}>
            <div className="filter-form">
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={searchParams.activityCategory}
                      onChange={handleSearchParamChange("activityCategory")}
                      label="Category"
                    >
                      <MenuItem value="">All</MenuItem>
                      {ACTIVITY_CATEGORIES.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category.replace(/_/g, " ")}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={searchParams.status}
                      onChange={handleSearchParamChange("status")}
                      label="Status"
                      displayEmpty
                    >
                      <MenuItem value="">
                        <em>All Statuses</em>
                      </MenuItem>
                      {["PUBLISHED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((status) => (
                        <MenuItem key={status} value={status}>
                          {status.replace(/_/g, " ")}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Organization"
                    size="small"
                    value={searchParams.organizationName}
                    onChange={handleSearchParamChange("organizationName")}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Venue"
                    size="small"
                    value={searchParams.activityVenue}
                    onChange={handleSearchParamChange("activityVenue")}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <DateTimePicker
                    label="Start Date From"
                    value={searchParams.startDateFrom}
                    onChange={(date) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        startDateFrom: date,
                      }))
                    }
                    renderInput={(params) => (
                      <TextField {...params} fullWidth size="small" />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <DateTimePicker
                    label="Start Date To"
                    value={searchParams.startDateTo}
                    onChange={(date) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        startDateTo: date,
                      }))
                    }
                    renderInput={(params) => (
                      <TextField {...params} fullWidth size="small" />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Min Capacity"
                    type="number"
                    size="small"
                    value={searchParams.minCapacity}
                    onChange={handleSearchParamChange("minCapacity")}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Max Capacity"
                    type="number"
                    size="small"
                    value={searchParams.maxCapacity}
                    onChange={handleSearchParamChange("maxCapacity")}
                  />
                </Grid>
              </Grid>
            </div>
          </Collapse>
        </Paper>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        {!loading && !error && activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <FaCalendarTimes className="text-5xl mb-4" />
            <p className="text-xl">No activities found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => handleActivityClick(activity.id)}
                  className="activity-card bg-white dark:bg-slate-700 rounded-xl shadow-md overflow-hidden cursor-pointer transform transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-gray-50 dark:hover:bg-slate-600 border border-gray-100 dark:border-slate-600"
                >
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                      {activity.activityName}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                      {activity.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <FaMapMarkerAlt className="text-gray-400 mt-1 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {activity.activityVenue}
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <FaClock className="text-gray-400 mt-1 flex-shrink-0" />
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          <div>
                            <span className="font-medium">Start:</span>{" "}
                            {formatDate(activity.startDate)}
                          </div>
                          <div>
                            <span className="font-medium">End:</span>{" "}
                            {formatDate(activity.endDate)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap justify-between items-center">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                            activity.activityStatus
                          )}`}
                        >
                          {activity.activityStatus.replace(/_/g, " ")}
                        </span>
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getCategoryStyle(
                            activity.activityCategory
                          )}`}
                        >
                          {activity.activityCategory.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-600 px-2 py-1 rounded-full">
                        <FaUsers className="text-gray-500 dark:text-gray-300" />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {activity.current_participants}/{activity.capacity_limit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {activities.length > 0 && (
              <div className="pagination-container">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
                  <Box>
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={pagination.size}
                        onChange={handlePageSizeChange}
                        displayEmpty
                      >
                        {pageSizeOptions.map((size) => (
                          <MenuItem key={size} value={size}>
                            {size} per page
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.page} // Already 1-based
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              </div>
            )}
          </>
        )}
      </div>
    </LocalizationProvider>
  );
};

export default Dashboard;
