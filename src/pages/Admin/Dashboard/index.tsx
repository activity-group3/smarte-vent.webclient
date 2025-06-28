"use client"

import React, { useEffect, useState, useMemo } from "react"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { DateTimePicker } from "@mui/x-date-pickers"
import {
  FaUsers,
  FaFilter,
  FaChartLine,
  FaStar,
  FaTag,
  FaChartBar,
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

// Enhanced interface with additional properties based on usage in the component
interface EnhancedGeneralStatistics {
  totalActivities: number;
  totalParticipants: number;
  totalOrganizations: number;
  completedActivities: number;
  pendingActivities: number;
  activitiesLastWeek?: number;
  activitiesLastMonth?: number;
  averageRating?: number;
  totalReviews?: number;
  activitiesByCategory?: Record<string, number>;
  averageRatingsByActivity?: Array<{
    activityId: string;
    score: number;
  }>;
  topKeywords?: Array<{
    keyword: string;
    count: number;
  }>;
  [key: string]: any;
}

interface FilterState {
  timePeriod: string;
  activityType: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
}

interface TimePeriod {
  label: string;
  value: string;
}

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface RatingDataItem {
  activityId: string;
  score: number;
  fill: string;
}

interface KeywordDataItem {
  keyword: string;
  count: number;
  fill: string;
}

/**
 * Admin Dashboard Component
 * Displays statistical data and analytics for administrators
 */
const AdminDashboard: React.FC = () => {
  // State management
  const [stats, setStats] = useState<EnhancedGeneralStatistics | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<number>(0)
  const [showFilters, setShowFilters] = useState<boolean>(false)

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    timePeriod: '',
    activityType: '',
    status: '',
    startDate: null,
    endDate: null
  })

  // Constants
  const COLORS = useMemo<string[]>(() => [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300'
  ], [])

  // Time period tabs
  const TIME_PERIODS = useMemo<TimePeriod[]>(() => [
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
  const fetchStatistics = async (): Promise<void> => {
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
   */
  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue)
    fetchTabStats(newValue)
  }

  /**
   * Fetches statistics based on selected time period tab
   */
  const fetchTabStats = async (tabIndex: number): Promise<void> => {
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
   */
  const handleFilterChange = <K extends keyof FilterState>(field: K, value: FilterState[K]): void => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  /**
   * Applies selected filters and fetches filtered statistics
   */
  const applyFilters = async (): Promise<void> => {
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
  const resetFilters = (): void => {
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
   */
  const prepareActivitiesByCategoryData = (): ChartDataItem[] => {
    if (!stats || !stats.activitiesByCategory) return []

    return Object.entries(stats.activitiesByCategory).map(([category, count], index) => ({
      name: formatCategoryName(category),
      value: count,
      color: COLORS[index % COLORS.length]
    }))
  }

  /**
   * Prepares data for the average ratings by activity bar chart
   */
  const prepareRatingData = (): RatingDataItem[] => {
    if (!stats || !stats.averageRatingsByActivity) return []

    return stats.averageRatingsByActivity.map((item, index) => ({
      activityId: item.activityId,
      score: item.score,
      fill: COLORS[index % COLORS.length]
    }))
  }

  /**
   * Prepares data for the top keywords horizontal bar chart
   */
  const prepareKeywordsData = (): KeywordDataItem[] => {
    if (!stats || !stats.topKeywords) return []

    return stats.topKeywords.map((item, index) => ({
      keyword: item.keyword,
      count: item.count,
      fill: COLORS[index % COLORS.length]
    }))
  }

  /**
   * Formats category names for display
   */
  const formatCategoryName = (category: string): string => {
    if (!category) return 'Unknown'

    // Convert snake_case or camelCase to Title Case With Spaces
    return category
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str: string) => str.toUpperCase())
      .trim()
  }

  /**
   * Formats a timestamp to a readable date string
   */
  const formatDate = (timestamp: string): string => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleDateString()
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="admin-dashboard min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6">
        <Container maxWidth="xl">
          {/* Dashboard Header */}
          {/* @ts-ignore */}
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
                    slotProps={{
                      textField: {
                        fullWidth: true,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <DateTimePicker
                    label="End Date"
                    value={filters.endDate}
                    onChange={(date) => handleFilterChange('endDate', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                      },
                    }}
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
                          <FaChartLine style={{ fontSize: '24px' }} />
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
                          <FaUsers style={{ fontSize: '24px' }} />
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
                          <FaStar style={{ fontSize: '24px' }} />
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
                          <FaTag style={{ fontSize: '24px' }} />
                        </div>
                        <Typography variant="h3" className="font-bold">
                          {stats.topKeywords?.length || 0}
                        </Typography>
                        <Typography variant="body2" className="mt-2">
                          Most popular: {(stats.topKeywords?.length ?? 0) > 0 && stats.topKeywords ? stats.topKeywords[0].keyword : 'None'}
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
                              formatter={(value) => [`${typeof value === 'number' ? value.toFixed(1) : value}`, 'Average Rating']} 
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
              {stats.topKeywords && stats.topKeywords.length > 0 && (
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
