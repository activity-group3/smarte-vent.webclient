import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Box, Typography, Button, CircularProgress, Divider } from '@mui/material';
import { useParams } from 'react-router-dom';
import { 
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  People, 
  Event, 
  Star, 
  CheckCircle,
  Schedule
} from '@mui/icons-material';

// Import chart components
import PieChart from '../../../components/charts/PieChart';
import BarChart from '../../../components/charts/BarChart';
import LineChart from '../../../components/charts/LineChart';
import StatsCard from '../../../components/charts/StatsCard';
import DataTable from '../../../components/charts/DataTable';

// Import service
import { organizationStatisticsService } from '../../../services/organizationStatisticsService';

const Dashboard = () => {
  const { organizationId } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState('weekly');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Default to an organization ID if not provided in the URL
        const orgId = organizationId || 1;
        
        let data;
        if (timePeriod === 'all') {
          data = await organizationStatisticsService.getOrganizationStatistics(orgId);
        } else {
          data = await organizationStatisticsService.getTimePeriodStatistics(orgId, timePeriod);
        }
        
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching organization statistics:', err);
        setError('Failed to load organization statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [organizationId, timePeriod]);

  // Format data for charts
  const prepareActivityStatusData = () => {
    if (!stats) return [];
    
    return [
      { name: 'Upcoming', value: stats.upcomingActivities },
      { name: 'In Progress', value: stats.inProgressActivities },
      { name: 'Completed', value: stats.completedActivities },
      { name: 'Canceled', value: stats.canceledActivities }
    ];
  };

  const prepareCategoryData = () => {
    if (!stats || !stats.activitiesByCategory) return [];
    
    return Object.entries(stats.activitiesByCategory).map(([category, count]) => ({
      name: category,
      value: count
    }));
  };

  const prepareMonthlyData = () => {
    if (!stats || !stats.activitiesByMonth) return [];
    
    return Object.entries(stats.activitiesByMonth).map(([month, count]) => ({
      name: month,
      activities: count,
      participants: stats.participantsByMonth?.[month] || 0
    }));
  };

  const prepareTopActivitiesData = () => {
    if (!stats || !stats.topActivities) return [];
    
    return stats.topActivities.map(activity => ({
      id: activity.activityId,
      name: activity.activityName,
      participants: activity.participantCount,
      category: activity.category,
      status: activity.status
    }));
  };

  const prepareBestRatedActivitiesData = () => {
    if (!stats || !stats.bestRatedActivities) return [];
    
    return stats.bestRatedActivities.map(activity => ({
      id: activity.activityId,
      name: activity.activityName,
      rating: activity.averageRating,
      feedbacks: activity.feedbackCount,
      category: activity.category
    }));
  };

  // Column definitions for tables
  const topActivitiesColumns = [
    { id: 'name', label: 'Activity Name' },
    { id: 'participants', label: 'Participants', align: 'right' },
    { id: 'category', label: 'Category' },
    { id: 'status', label: 'Status' }
  ];

  const bestRatedColumns = [
    { id: 'name', label: 'Activity Name' },
    { id: 'rating', label: 'Rating', align: 'center' },
    { id: 'feedbacks', label: 'Feedback Count', align: 'right' },
    { id: 'category', label: 'Category' }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Organization Dashboard
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, bgcolor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      ) : (
        <>
          {/* Time period selector */}
          <Box mb={3} display="flex" flexWrap="wrap" gap={1}>
            <Button 
              variant={timePeriod === 'all' ? 'contained' : 'outlined'} 
              onClick={() => setTimePeriod('all')}
            >
              All Time
            </Button>
            <Button 
              variant={timePeriod === 'daily' ? 'contained' : 'outlined'} 
              onClick={() => setTimePeriod('daily')}
            >
              Daily
            </Button>
            <Button 
              variant={timePeriod === 'weekly' ? 'contained' : 'outlined'} 
              onClick={() => setTimePeriod('weekly')}
            >
              Weekly
            </Button>
            <Button 
              variant={timePeriod === 'monthly' ? 'contained' : 'outlined'} 
              onClick={() => setTimePeriod('monthly')}
            >
              Monthly
            </Button>
            <Button 
              variant={timePeriod === 'quarterly' ? 'contained' : 'outlined'} 
              onClick={() => setTimePeriod('quarterly')}
            >
              Quarterly
            </Button>
            <Button 
              variant={timePeriod === 'yearly' ? 'contained' : 'outlined'} 
              onClick={() => setTimePeriod('yearly')}
            >
              Yearly
            </Button>
          </Box>

          {/* Organization Info */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5">{stats.organizationName}</Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Type: {stats.organizationType}
            </Typography>
          </Paper>

          {/* Key Metrics */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard 
                title="Total Activities" 
                value={stats.totalActivities} 
                icon={<Event fontSize="large" />}
                bgColor="#e3f2fd"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard 
                title="Total Participants" 
                value={stats.totalParticipants} 
                icon={<People fontSize="large" />}
                bgColor="#e8f5e9"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard 
                title="Participation Rate" 
                value={`${(stats.participationRate || 0).toFixed(1)}%`} 
                icon={<TrendingUp fontSize="large" />}
                bgColor="#fff8e1"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard 
                title="Avg. Feedback Rating" 
                value={(stats.averageFeedbackRating || 0).toFixed(1)} 
                icon={<Star fontSize="large" />}
                bgColor="#f3e5f5"
              />
            </Grid>
          </Grid>

          {/* Activity Status */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <PieChart 
                  data={prepareActivityStatusData()} 
                  title="Activities by Status" 
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <PieChart 
                  data={prepareCategoryData()} 
                  title="Activities by Category" 
                />
              </Paper>
            </Grid>
          </Grid>

          {/* Time-based Charts */}
          <Grid container spacing={3} mt={1}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <LineChart 
                  data={prepareMonthlyData()} 
                  title="Activities and Participants Over Time" 
                  xAxisDataKey="name"
                  lines={[
                    { dataKey: 'activities', name: 'Activities', color: '#8884d8' },
                    { dataKey: 'participants', name: 'Participants', color: '#82ca9d' }
                  ]}
                />
              </Paper>
            </Grid>
          </Grid>

          {/* Tables */}
          <Grid container spacing={3} mt={1}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <DataTable 
                  title="Top Activities by Participation"
                  data={prepareTopActivitiesData()}
                  columns={topActivitiesColumns}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <DataTable 
                  title="Best Rated Activities"
                  data={prepareBestRatedActivitiesData()}
                  columns={bestRatedColumns}
                />
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default Dashboard;