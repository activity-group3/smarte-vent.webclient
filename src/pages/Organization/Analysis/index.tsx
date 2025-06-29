import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button,
  CircularProgress,
  Divider,
  TextField,
  SelectChangeEvent
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useParams } from 'react-router-dom';

// Import chart components
import PieChart from '../../../components/charts/PieChart';
import BarChart from '../../../components/charts/BarChart';
import LineChart from '../../../components/charts/LineChart';
import StatsCard from '../../../components/charts/StatsCard';
import DataTable from '../../../components/charts/DataTable';

// Import service
import { organizationStatisticsService } from '../../../services/organizationStatisticsService';
import { account } from '@/context/user';

// Type definitions
interface OrganizationStatistics {
  organizationName?: string;
  organizationType?: string;
  totalActivities?: number;
  totalParticipants?: number;
  averageParticipantsPerActivity?: number;
  participationRate?: number;
  averageFeedbackRating?: number;
  totalFeedbacks?: number;
  upcomingActivities?: number;
  inProgressActivities?: number;
  completedActivities?: number;
  canceledActivities?: number;
  activitiesByCategory?: Record<string, number>;
  participantsByCategory?: Record<string, number>;
  activitiesByMonth?: Record<string, number>;
  participantsByMonth?: Record<string, number>;
  topActivities?: TopActivity[];
  bestRatedActivities?: BestRatedActivity[];
  [key: string]: any; // Allow for additional properties
}

interface TopActivity {
  activityId: number;
  activityName: string;
  currentParticipants: number;
  category: string;
  status: string;
  participationRate: number;
}

interface BestRatedActivity {
  activityId: number;
  activityName: string;
  averageRating: number;
  feedbackCount: number;
  category: string;
}

interface Filters {
  timePeriod: string;
  activityType: string;
  status: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
}

interface ChartData {
  name: string;
  value: number;
}

interface MonthlyData {
  name: string;
  activities: number;
  participants: number;
}

interface TopActivityTableData {
  id: number;
  name: string;
  participants: number;
  category: string;
  status: string;
  participationRate: string;
}

interface BestRatedTableData {
  id: number;
  name: string;
  rating: number;
  feedbacks: number;
  category: string;
}

interface Column {
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right';
}

const Analysis: React.FC = () => {
  const { organizationId } = useParams<{ organizationId?: string }>();
  const [stats, setStats] = useState<OrganizationStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState<Filters>({
    timePeriod: '',
    activityType: '',
    status: '',
    startDate: null,
    endDate: null
  });

  // Initial load of stats
  useEffect(() => {
    const fetchInitialData = async (): Promise<void> => {
      setLoading(true);
      try {
        // Default to an organization ID if not provided in the URL
        const orgId = organizationId || account.id;
        const data = await organizationStatisticsService.getOrganizationStatistics(orgId);
        setStats(data as OrganizationStatistics);
        setError(null);
      } catch (err) {
        console.error('Error fetching organization statistics:', err);
        setError('Failed to load organization statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [organizationId]);

  // Handle filter changes
  const handleFilterChange = (field: keyof Filters, value: string | Dayjs | null): void => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Apply filters
  const applyFilters = async (): Promise<void> => {
    setLoading(true);
    try {
      // Default to an organization ID if not provided in the URL
      const orgId = organizationId || account.id;
      
      // Convert dates to ISO strings if they exist
      const filterData = {
        ...filters,
        startDate: filters.startDate ? filters.startDate.toDate().toISOString() : undefined,
        endDate: filters.endDate ? filters.endDate.toDate().toISOString() : undefined
      };
      
      // If we have specific date range but no time period
      if ((filterData.startDate || filterData.endDate) && !filterData.timePeriod) {
        const data = await organizationStatisticsService.getDateRangeStatistics(
          orgId, 
          filterData.startDate, 
          filterData.endDate
        );
        setStats(data);
      } else {
        // Use the filter endpoint
        const data = await organizationStatisticsService.getFilteredOrganizationStatistics(orgId, filterData);
        setStats(data);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching filtered organization statistics:', err);
      setError('Failed to apply filters');
    } finally {
      setLoading(false);
    }
  };

  // Reset filters
  const resetFilters = async (): Promise<void> => {
    setFilters({
      timePeriod: '',
      activityType: '',
      status: '',
      startDate: null,
      endDate: null
    });
    
    // Reload initial data
    setLoading(true);
    try {
      const orgId = organizationId || account.id;
      const data = await organizationStatisticsService.getOrganizationStatistics(orgId);
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching organization statistics:', err);
      setError('Failed to reset filters');
    } finally {
      setLoading(false);
    }
  };

  // Format data for charts
  const prepareActivityStatusData = (): ChartData[] => {
    if (!stats) return [];
    
    return [
      { name: 'Upcoming', value: stats.upcomingActivities || 0 },
      { name: 'In Progress', value: stats.inProgressActivities || 0 },
      { name: 'Completed', value: stats.completedActivities || 0 },
      { name: 'Canceled', value: stats.canceledActivities || 0 }
    ];
  };

  const prepareCategoryData = (): ChartData[] => {
    if (!stats || !stats.activitiesByCategory) return [];
    
    return Object.entries(stats.activitiesByCategory).map(([category, count]) => ({
      name: category.replace(/_/g, ' '),
      value: count
    }));
  };

  const prepareParticipantsByCategoryData = (): ChartData[] => {
    if (!stats || !stats.participantsByCategory) return [];
    
    return Object.entries(stats.participantsByCategory).map(([category, count]) => ({
      name: category.replace(/_/g, ' '),
      value: count
    }));
  };

  const prepareMonthlyData = (): MonthlyData[] => {
    if (!stats || !stats.activitiesByMonth) return [];
    
    return Object.entries(stats.activitiesByMonth).map(([month, count]) => ({
      name: month,
      activities: count,
      participants: stats.participantsByMonth?.[month] || 0
    }));
  };

  const prepareTopActivitiesData = (): TopActivityTableData[] => {
    if (!stats || !stats.topActivities) return [];
    
    return stats.topActivities.map((activity: TopActivity) => ({
      id: activity.activityId,
      name: activity.activityName,
      participants: activity.currentParticipants || 0,
      category: activity.category.replace(/_/g, ' '),
      status: activity.status.replace(/_/g, ' '),
      participationRate: activity.participationRate ? `${(activity.participationRate * 100).toFixed(1)}%` : '0%'
    }));
  };

  const prepareBestRatedActivitiesData = (): BestRatedTableData[] => {
    if (!stats || !stats.bestRatedActivities) return [];
    
    return stats.bestRatedActivities.map((activity: BestRatedActivity) => ({
      id: activity.activityId,
      name: activity.activityName,
      rating: activity.averageRating || 0,
      feedbacks: activity.feedbackCount || 0,
      category: activity.category.replace(/_/g, ' ')
    }));
  };

  // Column definitions for tables
  const topActivitiesColumns: Column[] = [
    { id: 'name', label: 'Activity Name' },
    { id: 'participants', label: 'Participants', align: 'right' },
    { id: 'participationRate', label: 'Participation Rate', align: 'right' },
    { id: 'category', label: 'Category' },
    { id: 'status', label: 'Status' }
  ];

  const bestRatedColumns: Column[] = [
    { id: 'name', label: 'Activity Name' },
    { id: 'rating', label: 'Rating', align: 'center' },
    { id: 'feedbacks', label: 'Feedback Count', align: 'right' },
    { id: 'category', label: 'Category' }
  ];

  const handleSelectChange = (field: keyof Filters) => (event: SelectChangeEvent<string>): void => {
    handleFilterChange(field, event.target.value);
  };

  const handleDateChange = (field: keyof Filters) => (date: Dayjs | null): void => {
    handleFilterChange(field, date);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          Organization Analysis
        </h1>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Filters
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <FormControl fullWidth>
              <InputLabel id="time-period-label">Time Period</InputLabel>
              <Select
                labelId="time-period-label"
                id="time-period"
                value={filters.timePeriod}
                label="Time Period"
                onChange={handleSelectChange('timePeriod')}
              >
                <MenuItem value="">All Time</MenuItem>
                <MenuItem value="DAILY">Daily</MenuItem>
                <MenuItem value="WEEKLY">Weekly</MenuItem>
                <MenuItem value="MONTHLY">Monthly</MenuItem>
                <MenuItem value="QUARTERLY">Quarterly</MenuItem>
                <MenuItem value="YEARLY">Yearly</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="activity-type-label">Activity Type</InputLabel>
              <Select
                labelId="activity-type-label"
                id="activity-type"
                value={filters.activityType}
                label="Activity Type"
                onChange={handleSelectChange('activityType')}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="WORKSHOP">Workshop</MenuItem>
                <MenuItem value="SEMINAR">Seminar</MenuItem>
                <MenuItem value="CONFERENCE">Conference</MenuItem>
                <MenuItem value="TRAINING">Training</MenuItem>
                <MenuItem value="VOLUNTEERING">Volunteering</MenuItem>
                <MenuItem value="SOCIAL">Social</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                id="status"
                value={filters.status}
                label="Status"
                onChange={handleSelectChange('status')}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="UPCOMING">Upcoming</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="CANCELED">Canceled</MenuItem>
              </Select>
            </FormControl>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <DateTimePicker
              label="Start Date"
              value={filters.startDate}
              onChange={handleDateChange('startDate')}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <DateTimePicker
              label="End Date"
              value={filters.endDate}
              onChange={handleDateChange('endDate')}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <div className="flex items-center space-x-4">
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                onClick={applyFilters}
                disabled={loading}
              >
                Apply Filters
              </button>
              <button 
                className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 disabled:opacity-50"
                onClick={resetFilters}
                disabled={loading}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center my-8">
            <CircularProgress />
          </div>
        ) : error ? (
          <div className="bg-red-100 p-4 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        ) : stats ? (
          <>
            {/* Organization Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold">{stats.organizationName}</h2>
              <p className="text-gray-600">
                Type: {stats.organizationType?.replace(/_/g, ' ') || 'Unknown'}
              </p>
              
              {/* Applied Filters */}
              {(filters.timePeriod || filters.activityType || filters.status || filters.startDate || filters.endDate) && (
                <div className="mt-4">
                  <p className="text-sm font-semibold mb-2">Applied Filters:</p>
                  <div className="flex flex-wrap gap-2">
                    {filters.timePeriod && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        Period: {filters.timePeriod}
                      </span>
                    )}
                    {filters.activityType && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        Type: {filters.activityType}
                      </span>
                    )}
                    {filters.status && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        Status: {filters.status}
                      </span>
                    )}
                    {filters.startDate && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        From: {filters.startDate.format('YYYY-MM-DD HH:mm')}
                      </span>
                    )}
                    {filters.endDate && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        To: {filters.endDate.format('YYYY-MM-DD HH:mm')}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
              <StatsCard 
                title="Total Activities" 
                value={stats.totalActivities || 0} 
                bgColor="#e3f2fd"
              />
              <StatsCard 
                title="Total Participants" 
                value={stats.totalParticipants || 0} 
                bgColor="#e8f5e9"
              />
              <StatsCard 
                title="Avg. Participants Per Activity" 
                value={(stats.averageParticipantsPerActivity || 0).toFixed(1)} 
                bgColor="#fff8e1"
              />
              <StatsCard 
                title="Participation Rate" 
                value={`${(stats.participationRate || 0).toFixed(1)}%`} 
                bgColor="#f3e5f5"
              />
              <StatsCard 
                title="Avg. Feedback Rating" 
                value={(stats.averageFeedbackRating || 0).toFixed(1)} 
                bgColor="#e0f7fa"
              />
              <StatsCard 
                title="Total Feedbacks" 
                value={stats.totalFeedbacks || 0} 
                bgColor="#f1f8e9"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-4">
                <PieChart 
                  data={prepareActivityStatusData()} 
                  title="Activities by Status" 
                />
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <PieChart 
                  data={prepareCategoryData()} 
                  title="Activities by Category" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-4">
                <BarChart 
                  data={prepareCategoryData()} 
                  title="Activities Count by Category" 
                  bars={[{ dataKey: 'value', name: 'Activities', color: '#8884d8' }]}
                />
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <BarChart 
                  data={prepareParticipantsByCategoryData()} 
                  title="Participants Count by Category" 
                  bars={[{ dataKey: 'value', name: 'Participants', color: '#82ca9d' }]}
                />
              </div>
            </div>

            {Object.keys(stats.activitiesByMonth || {}).length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <LineChart 
                  data={prepareMonthlyData()} 
                  title="Activities and Participants Over Time" 
                  xAxisDataKey="name"
                  lines={[
                    { dataKey: 'activities', name: 'Activities', color: '#8884d8' },
                    { dataKey: 'participants', name: 'Participants', color: '#82ca9d' }
                  ]}
                />
              </div>
            )}

            {/* Tables */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <DataTable 
                title="Top Activities by Participation"
                data={prepareTopActivitiesData()}
                columns={topActivitiesColumns}
              />
            </div>

            {stats.bestRatedActivities && stats.bestRatedActivities.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <DataTable 
                  title="Best Rated Activities"
                  data={prepareBestRatedActivitiesData()}
                  columns={bestRatedColumns}
                />
              </div>
            )}
          </>
        ) : null}
      </div>
    </LocalizationProvider>
  );
};

export default Analysis;
