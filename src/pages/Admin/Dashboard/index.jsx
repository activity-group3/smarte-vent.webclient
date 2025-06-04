"use client"

import { useEffect, useState, useMemo } from "react"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { DateTimePicker } from "@mui/x-date-pickers"
import {
  FaUsers,
  FaFilter,
  FaChartLine,
  FaRegThumbsUp,
  FaCommentAlt,
  FaChartBar,
  FaChartPie,
  FaCalendarAlt,
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
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  CircularProgress,
  Chip,
  Tooltip,
} from "@mui/material"
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

// Import the statistics service
import { statisticsService } from '../../../services/statisticsService'

// Import styles
import './adminDashboard.css'

/**
 * Admin Dashboard Component
 * Displays statistical data and analytics for administrators
 */
const AdminDashboard = () => {
  // State management
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  // Filter state
  const [filters, setFilters] = useState({
    timePeriod: '',
    activityType: '',
    status: '',
    startDate: null,
    endDate: null
  })

  // Constants
  const COLORS = useMemo(() => [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300'
  ], [])

  // Time period tabs
  const TIME_PERIODS = useMemo(() => [
    { label: 'All Time', value: 'all' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Quarterly', value: 'quarterly' },
    { label: 'Yearly', value: 'yearly' }
  ], [])

  // Initial data fetch
  useEffect(() => {
    fetchStatistics()
  }, [])

  /**
   * Fetches the initial statistics data
   */
  const fetchStatistics = async () => {
    setLoading(true)
    try {
      const data = await statisticsService.getStatistics()
      setStats(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching statistics:', err)
      setError('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handles tab change and fetches corresponding statistics
   * @param {Event} event - The event object
   * @param {number} newValue - The index of the selected tab
   */
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
    fetchTabStats(newValue)
  }

  /**
   * Fetches statistics based on selected time period tab
   * @param {number} tabIndex - The index of the selected tab
   */
  const fetchTabStats = async (tabIndex) => {
    setLoading(true)
    try {
      const period = TIME_PERIODS[tabIndex].value
      let data

      if (period === 'all') {
        data = await statisticsService.getStatistics()
      } else {
        data = await statisticsService.getTimePeriodStatistics(period)
      }

      setStats(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching statistics:', err)
      setError('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Updates filter state when a filter value changes
   * @param {string} field - The filter field to update
   * @param {any} value - The new value for the filter
   */
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  /**
   * Applies selected filters and fetches filtered statistics
   */
  const applyFilters = async () => {
    setLoading(true)
    try {
      // Convert dates to ISO strings if they exist
      const filterData = {
        ...filters,
        startDate: filters.startDate ? filters.startDate.toISOString() : undefined,
        endDate: filters.endDate ? filters.endDate.toISOString() : undefined
      }

      const data = await statisticsService.getFilteredStatistics(filterData)
      setStats(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching filtered statistics:', err)
      setError('Failed to load filtered statistics')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Resets all filters to default values and fetches unfiltered statistics
   */
  const resetFilters = () => {
    setFilters({
      timePeriod: '',
      activityType: '',
      status: '',
      startDate: null,
      endDate: null
    })
    fetchStatistics()
  }

  /**
   * Prepares data for the activities by category pie chart
   * @returns {Array} Formatted data for the pie chart
   */
  const prepareActivitiesByCategoryData = () => {
    if (!stats || !stats.activitiesByCategory) return []

    return Object.entries(stats.activitiesByCategory).map(([category, count], index) => ({
      name: formatCategoryName(category),
      value: count,
      color: COLORS[index % COLORS.length]
    }))
  }

  /**
   * Prepares data for the average ratings by activity bar chart
   * @returns {Array} Formatted data for the bar chart
   */
  const prepareRatingData = () => {
    if (!stats || !stats.averageRatingsByActivity) return []

    return stats.averageRatingsByActivity.map((item, index) => ({
      activityId: item.activityId,
      score: item.score,
      fill: COLORS[index % COLORS.length]
    }))
  }

  /**
   * Prepares data for the top keywords horizontal bar chart
   * @returns {Array} Formatted data for the horizontal bar chart
   */
  const prepareKeywordsData = () => {
    if (!stats || !stats.topKeywords) return []

    return stats.topKeywords.map((item, index) => ({
      keyword: item.keyword,
      count: item.count,
      fill: COLORS[index % COLORS.length]
    }))
  }

  /**
   * Formats category names for display
   * @param {string} category - The category name to format
   * @returns {string} Formatted category name
   */
  const formatCategoryName = (category) => {
    if (!category) return 'Unknown'

    // Convert snake_case or camelCase to Title Case With Spaces
    return category
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }

  /**
   * Formats a timestamp to a readable date string
   * @param {string} timestamp - The timestamp to format
   * @returns {string} Formatted date string
   */
  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleDateString()
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="admin-dashboard min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6">
        <Container maxWidth="xl">
          {/* Dashboard Header */}
          <Box className="dashboard-header mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <Typography variant="h4" className="font-bold text-gray-800 mb-2">
                Admin Dashboard
              </Typography>
              <Typography variant="body1" className="text-gray-600">
                Comprehensive statistics and analysis of all activities
              </Typography>
            </div>
            <div className="dashboard-actions mt-4 md:mt-0 flex space-x-2">
              <Button
                variant="outlined"
                startIcon={<FaFilter />}
                onClick={() => setShowFilters(!showFilters)}
                className="filter-button"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<FaChartLine />}
                onClick={fetchStatistics}
                className="refresh-button"
              >
                Refresh Data
              </Button>
            </div>
          </Box>

          {/* Error Alert */}
          {error && (
            <Paper className="error-alert p-4 mb-6 bg-red-50 border-l-4 border-red-500">
              <Typography className="text-red-700">{error}</Typography>
            </Paper>
          )}

          {/* Filter Panel */}
          <Collapse in={showFilters}>
            <Paper className="filter-panel p-6 mb-6 bg-white shadow-md rounded-lg">
              <Typography variant="h6" className="mb-4 font-semibold">
                Filter Options
              </Typography>
              <Grid container spacing={3}>
                {/* Time Period Filter */}
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Time Period</InputLabel>
                    <Select
                      value={filters.timePeriod}
                      label="Time Period"
                      onChange={(e) => handleFilterChange('timePeriod', e.target.value)}
                    >
                      <MenuItem value="">All Time</MenuItem>
                      <MenuItem value="DAY">Daily</MenuItem>
                      <MenuItem value="WEEK">Weekly</MenuItem>
                      <MenuItem value="MONTH">Monthly</MenuItem>
                      <MenuItem value="QUARTER">Quarterly</MenuItem>
                      <MenuItem value="YEAR">Yearly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Activity Type Filter */}
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Activity Type</InputLabel>
                    <Select
                      value={filters.activityType}
                      label="Activity Type"
                      onChange={(e) => handleFilterChange('activityType', e.target.value)}
                    >
                      <MenuItem value="">All Types</MenuItem>
                      <MenuItem value="STUDENT_ORGANIZATION">Student Organization</MenuItem>
                      <MenuItem value="UNIVERSITY">University</MenuItem>
                      <MenuItem value="THIRD_PARTY">Third Party</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Status Filter */}
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      label="Status"
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                      <MenuItem value="">All Status</MenuItem>
                      <MenuItem value="ACTIVE">Active</MenuItem>
                      <MenuItem value="COMPLETED">Completed</MenuItem>
                      <MenuItem value="CANCELLED">Cancelled</MenuItem>
                      <MenuItem value="PENDING">Pending</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Date Range Filters */}
                <Grid item xs={12} md={3}>
                  <DateTimePicker
                    label="Start Date"
                    value={filters.startDate}
                    onChange={(date) => handleFilterChange('startDate', date)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <DateTimePicker
                    label="End Date"
                    value={filters.endDate}
                    onChange={(date) => handleFilterChange('endDate', date)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                
                {/* Filter Action Buttons */}
                <Grid item xs={12} md={3} className="filter-actions flex items-center">
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={applyFilters}
                    disabled={loading}
                    className="apply-button mr-2"
                  >
                    Apply Filters
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={resetFilters}
                    disabled={loading}
                    className="reset-button"
                  >
                    Reset
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Collapse>

          {/* Time Period Tabs */}
          <Paper className="time-period-tabs mb-6 bg-white shadow-md rounded-lg overflow-hidden">
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              className="border-b border-gray-200"
            >
              {TIME_PERIODS.map((period, index) => (
                <Tab 
                  key={period.value} 
                  label={period.label} 
                  icon={index === 0 ? <FaChartLine /> : <FaCalendarAlt />} 
                  iconPosition="start" 
                />
              ))}
            </Tabs>
          </Paper>

          {/* Content Display - Loading, Data, or Empty State */}
          {loading ? (
            <div className="loading-container flex justify-center items-center py-20">
              <CircularProgress size={40} thickness={4} />
              <Typography variant="h6" className="ml-3">Loading statistics...</Typography>
            </div>
          ) : stats ? (
            <>
              {/* Key Metrics Cards */}
              <section className="key-metrics-section">
                <Grid container spacing={3} className="mb-6">
                  {/* Total Activities Card */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Card className="metric-card activities-card bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-shadow">
                      <CardContent>
                        <div className="flex justify-between items-center mb-4">
                          <Typography variant="h6">Total Activities</Typography>
                          <FaChartLine size={24} />
                        </div>
                        <Typography variant="h3" className="font-bold">
                          {stats.totalActivities || 0}
                        </Typography>
                        <Typography variant="body2" className="mt-2">
                          <span className="font-semibold">{stats.activitiesLastWeek || 0}</span> new in the last week
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Total Participants Card */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Card className="metric-card participants-card bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-shadow">
                      <CardContent>
                        <div className="flex justify-between items-center mb-4">
                          <Typography variant="h6">Total Participants</Typography>
                          <FaUsers size={24} />
                        </div>
                        <Typography variant="h3" className="font-bold">
                          {stats.totalParticipants || 0}
                        </Typography>
                        <Typography variant="body2" className="mt-2">
                          <span className="font-semibold">{stats.activitiesLastMonth || 0}</span> activities last month
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Average Rating Card */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Card className="metric-card rating-card bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow">
                      <CardContent>
                        <div className="flex justify-between items-center mb-4">
                          <Typography variant="h6">Average Rating</Typography>
                          <FaRegThumbsUp size={24} />
                        </div>
                        <Typography variant="h3" className="font-bold">
                          {(stats.averageRating || 0).toFixed(1)}
                        </Typography>
                        <Typography variant="body2" className="mt-2">
                          From <span className="font-semibold">{stats.totalReviews || 0}</span> total reviews
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Top Keywords Card */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Card className="metric-card keywords-card bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg hover:shadow-xl transition-shadow">
                      <CardContent>
                        <div className="flex justify-between items-center mb-4">
                          <Typography variant="h6">Top Keywords</Typography>
                          <FaCommentAlt size={24} />
                        </div>
                        <Typography variant="h3" className="font-bold">
                          {stats.topKeywords?.length || 0}
                        </Typography>
                        <Typography variant="body2" className="mt-2">
                          Most popular: {stats.topKeywords?.length > 0 ? stats.topKeywords[0].keyword : 'None'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </section>

              {/* Data Visualization Section */}
              <section className="data-visualization-section">
                <Grid container spacing={3} className="mb-6">
                  {/* Activities by Category Chart */}
                  <Grid item xs={12} md={6}>
                    <Paper className="chart-container p-4 h-full bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow">
                      <Typography variant="h6" className="chart-title mb-4 font-semibold">
                        Activities by Category
                      </Typography>
                      <div className="chart-wrapper h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={prepareActivitiesByCategoryData()}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              animationDuration={1000}
                              animationBegin={0}
                            >
                              {prepareActivitiesByCategoryData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip formatter={(value) => [`${value} activities`, 'Count']} />
                            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </Paper>
                  </Grid>

                  {/* Average Ratings by Activity Chart */}
                  <Grid item xs={12} md={6}>
                    <Paper className="chart-container p-4 h-full bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow">
                      <Typography variant="h6" className="chart-title mb-4 font-semibold">
                        Average Ratings by Activity
                      </Typography>
                      <div className="chart-wrapper h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={prepareRatingData()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                            <XAxis dataKey="activityId" tick={{ fontSize: 12 }} />
                            <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                            <RechartsTooltip 
                              formatter={(value) => [`${value.toFixed(1)}`, 'Average Rating']} 
                              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                            />
                            <Bar 
                              dataKey="score" 
                              name="Rating Score"
                              animationDuration={1500}
                              animationBegin={0}
                            >
                              {prepareRatingData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Paper>
                  </Grid>

                  {/* Top Keywords Chart */}
                  <Grid item xs={12}>
                    <Paper className="chart-container p-4 bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow">
                      <Typography variant="h6" className="chart-title mb-4 font-semibold">
                        Top Keywords Frequency
                      </Typography>
                      <div className="chart-wrapper h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            data={prepareKeywordsData()} 
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 12 }} />
                            <YAxis 
                              dataKey="keyword" 
                              type="category" 
                              width={150} 
                              tick={{ fontSize: 12 }}
                              axisLine={false}
                            />
                            <RechartsTooltip 
                              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                              formatter={(value) => [`${value} occurrences`, 'Frequency']}
                            />
                            <Bar 
                              dataKey="count" 
                              name="Frequency"
                              animationDuration={1500}
                              animationBegin={0}
                            >
                              {prepareKeywordsData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Paper>
                  </Grid>
                </Grid>
              </section>

              {/* Keywords Tag Cloud Section */}
              {stats.topKeywords?.length > 0 && (
                <section className="keywords-tag-section">
                  <Paper className="tag-cloud p-6 bg-white shadow-md rounded-lg mb-6 hover:shadow-lg transition-shadow">
                    <Typography variant="h6" className="mb-4 font-semibold">
                      Popular Keywords
                    </Typography>
                    <div className="flex flex-wrap gap-2">
                      {stats.topKeywords.map((keyword, index) => (
                        <Chip
                          key={index}
                          label={`${keyword.keyword} (${keyword.count})`}
                          color={index < 3 ? "primary" : "default"}
                          variant={index < 3 ? "filled" : "outlined"}
                          className={`keyword-chip text-sm ${index < 3 ? 'top-keyword' : ''}`}
                          size="medium"
                        />
                      ))}
                    </div>
                  </Paper>
                </section>
              )}
            </>
          ) : (
            <Paper className="empty-state p-6 text-center bg-white shadow-md rounded-lg">
              <Typography variant="h6" color="textSecondary">No statistical data available</Typography>
            </Paper>
          )}
        </Container>
      </div>
    </LocalizationProvider>
  )
}

export default AdminDashboard
