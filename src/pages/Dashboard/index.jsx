"use client"

import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
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
} from "react-icons/fa"
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
} from "@mui/material"
import { DateTimePicker } from "@mui/x-date-pickers"
import Sidebar from "./sidebar"

const AdminDashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 6,
  })

  const [sort, setSort] = useState({
    field: "startDate",
    direction: "desc",
  })

  const pageSizeOptions = [5, 10, 15, 20]

  const ACTIVITY_CATEGORIES = ["THIRD_PARTY", "UNIVERSITY", "DEPARTMENT", "STUDENT_ORGANIZATION"]

  const ACTIVITY_STATUSES = ["WAITING_TO_START", "IN_PROGRESS", "COMPLETED", "CANCELLED"]

  const [searchParams, setSearchParams] = useState({
    activityName: "",
    activityCategory: "",
    activityStatus: "",
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
  })

  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      navigate("/auth/login")
      return
    }
    setUser(JSON.parse(userData))
    fetchActivities(pagination.currentPage)
  }, [navigate, pagination.currentPage, pagination.pageSize, sort, searchParams])

  const handleSearchParamChange = (param) => (event) => {
    setSearchParams((prev) => ({
      ...prev,
      [param]: event.target.value,
    }))
  }

  const fetchActivities = async (page) => {
    try {
      const token = localStorage.getItem("access_token")

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: pagination.pageSize.toString(),
        sort: `${sort.field},${sort.direction}`,
      })

      // Add search parameters to query
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== "" && value !== null) {
          if (value instanceof Date) {
            queryParams.append(key, value.toISOString())
          } else {
            queryParams.append(key, value.toString())
          }
        }
      })

      const response = await fetch(`http://localhost:8080/activities/search?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()
      console.log(data)
      if (data.status_code === 200) {
        // Transform response data from snake_case to camelCase
        const transformedActivities = data.data.results.map((activity) => ({
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
        }))
        setActivities(transformedActivities)
        setPagination((prev) => ({
          ...prev,
          totalPages: data.data.total_pages,
        }))
      } else {
        setError("Failed to fetch activities")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user")
    navigate("/auth/login")
  }

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: newPage,
    }))
  }

  const handleSortChange = (event) => {
    const [field, direction] = event.target.value.split(",")
    setSort({ field, direction })
  }

  const handlePageSizeChange = (event) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: Number(event.target.value),
      currentPage: 1, // Reset to first page when changing page size
    }))
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "WAITING_TO_START":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-300"
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getCategoryStyle = (category) => {
    switch (category) {
      case "THIRD_PARTY":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "UNIVERSITY":
        return "bg-cyan-100 text-cyan-800 border-cyan-300"
      case "DEPARTMENT":
        return "bg-emerald-100 text-emerald-800 border-emerald-300"
      case "STUDENT_ORGANIZATION":
        return "bg-pink-100 text-pink-800 border-pink-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const handleActivityClick = (id) => {
    navigate(`/admin/activities/${id}`)
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Sidebar user={user} onLogout={handleLogout} />

      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-10">
          <header className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Welcome back, {user?.name || "Admin"}</p>
              </div>
              <div className="flex items-center gap-4">
                <IconButton className="relative">
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"></div>
                  <FaBell className="text-gray-600 dark:text-gray-300" />
                </IconButton>
                <IconButton onClick={handleLogout}>
                  <FaSignOutAlt className="text-gray-600 dark:text-gray-300" />
                </IconButton>
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

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upcoming Activities</h2>
              <div className="flex items-center gap-4">
                <select
                  value={`${sort.field},${sort.direction}`}
                  onChange={handleSortChange}
                  className="bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 p-2.5"
                >
                  <option value="startDate,desc">Latest First</option>
                  <option value="startDate,asc">Earliest First</option>
                  <option value="activityName,asc">Name A-Z</option>
                  <option value="activityName,desc">Name Z-A</option>
                </select>
                <select
                  value={pagination.pageSize}
                  onChange={handlePageSizeChange}
                  className="bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 p-2.5"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size} per page
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Paper className="mb-6 p-4 bg-gray-50 dark:bg-slate-700 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <TextField
                  label="Search Activity Name"
                  variant="outlined"
                  size="small"
                  value={searchParams.activityName}
                  onChange={handleSearchParamChange("activityName")}
                  className="w-full md:w-1/3"
                  InputProps={{
                    startAdornment: <FaSearch className="mr-2 text-gray-400" />,
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<FaFilter />}
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full md:w-auto"
                >
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
              </div>

              <Collapse in={showFilters}>
                <Grid container spacing={3}>
                  {/* First Row - Category and Status */}
                  <Grid item xs={12} md={6}>
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

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={searchParams.activityStatus}
                        onChange={handleSearchParamChange("activityStatus")}
                        label="Status"
                      >
                        <MenuItem value="">All</MenuItem>
                        {ACTIVITY_STATUSES.map((status) => (
                          <MenuItem key={status} value={status}>
                            {status.replace(/_/g, " ")}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Second Row - Organization and Venue */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Organization"
                      size="small"
                      value={searchParams.organizationName}
                      onChange={handleSearchParamChange("organizationName")}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Venue"
                      size="small"
                      value={searchParams.activityVenue}
                      onChange={handleSearchParamChange("activityVenue")}
                    />
                  </Grid>

                  {/* Third Row - Date Range */}
                  <Grid item xs={12} sm={6}>
                    <DateTimePicker
                      label="Start Date From"
                      value={searchParams.startDateFrom}
                      onChange={(date) =>
                        setSearchParams((prev) => ({
                          ...prev,
                          startDateFrom: date,
                        }))
                      }
                      renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <DateTimePicker
                      label="Start Date To"
                      value={searchParams.startDateTo}
                      onChange={(date) =>
                        setSearchParams((prev) => ({
                          ...prev,
                          startDateTo: date,
                        }))
                      }
                      renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                    />
                  </Grid>

                  {/* Fourth Row - Capacity Range */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Min Capacity"
                      type="number"
                      size="small"
                      value={searchParams.minCapacity}
                      onChange={handleSearchParamChange("minCapacity")}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
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
                            <span className="text-sm text-gray-700 dark:text-gray-300">{activity.activityVenue}</span>
                          </div>

                          <div className="flex items-start gap-2">
                            <FaClock className="text-gray-400 mt-1 flex-shrink-0" />
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                              <div>
                                <span className="font-medium">Start:</span> {formatDate(activity.startDate)}
                              </div>
                              <div>
                                <span className="font-medium">End:</span> {formatDate(activity.endDate)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap justify-between items-center">
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span
                              className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                                activity.activityStatus,
                              )}`}
                            >
                              {activity.activityStatus.replace(/_/g, " ")}
                            </span>
                            <span
                              className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getCategoryStyle(
                                activity.activityCategory,
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
                  <div className="flex justify-center mt-8">
                    <div className="inline-flex rounded-md shadow-sm">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-slate-700 dark:text-white border border-gray-300 dark:border-slate-600 rounded-l-lg hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {[...Array(pagination.totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => handlePageChange(index + 1)}
                          className={`px-4 py-2 text-sm font-medium border-t border-b border-r border-gray-300 dark:border-slate-600 ${pagination.currentPage === index + 1
                              ? "bg-primary-500 text-white"
                              : "bg-white dark:bg-slate-700 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600"
                            }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-slate-700 dark:text-white border border-gray-300 dark:border-slate-600 border-l-0 rounded-r-lg hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
