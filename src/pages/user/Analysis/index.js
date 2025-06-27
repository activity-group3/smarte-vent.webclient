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
    TextField
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';

// Import chart components
import PieChart from '../../../components/charts/PieChart';
import BarChart from '../../../components/charts/BarChart';
import LineChart from '../../../components/charts/LineChart';
import StatsCard from '../../../components/charts/StatsCard';
import DataTable from '../../../components/charts/DataTable';

// Import service
import { studentStatisticsService } from '../../../services/studentStatisticsService';
import { account } from '@/context/user';

const Analysis = () => {
    const [studentId, setStudentId] = useState(null); // For viewing specific student's stats (admin/manager only)
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter state
    const [filters, setFilters] = useState({
        timePeriod: '',
        activityCategory: '',
        participationRole: '',
        participationStatus: '',
        startDate: null,
        endDate: null
    });

    // Initial load of stats
    useEffect(() => {
        setStudentId(account.id);
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                let data;
                // Check if viewing own stats or a specific student's stats
                if (studentId) {
                    data = await studentStatisticsService.getStudentStatistics(studentId);
                } else {
                    data = await studentStatisticsService.getMyStatistics();
                }
                setStats(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching student statistics:', err);
                setError('Failed to load student statistics');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [studentId]);

    // Handle filter changes
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Apply filters
    const applyFilters = async () => {
        setLoading(true);
        try {
            // Convert dates to ISO strings if they exist
            const filterData = {
                ...filters,
                startDate: filters.startDate ? filters.startDate.toISOString() : undefined,
                endDate: filters.endDate ? filters.endDate.toISOString() : undefined
            };

            // If we have specific date range but no time period
            if ((filterData.startDate || filterData.endDate) && !filterData.timePeriod) {
                const data = await studentStatisticsService.getDateRangeStatistics(
                    studentId,
                    filterData.startDate,
                    filterData.endDate
                );
                setStats(data);
            } else {
                // Use the filter endpoint
                const data = await studentStatisticsService.getFilteredStudentStatistics(studentId, filterData);
                setStats(data);
            }

            setError(null);
        } catch (err) {
            console.error('Error fetching filtered student statistics:', err);
            setError('Failed to apply filters');
        } finally {
            setLoading(false);
        }
    };

    // Reset filters
    const resetFilters = async () => {
        setFilters({
            timePeriod: '',
            activityCategory: '',
            participationRole: '',
            participationStatus: '',
            startDate: null,
            endDate: null
        });

        // Reload initial data
        setLoading(true);
        try {
            let data;
            if (studentId) {
                data = await studentStatisticsService.getStudentStatistics(studentId);
            } else {
                data = await studentStatisticsService.getMyStatistics();
            }
            setStats(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching student statistics:', err);
            setError('Failed to reset filters');
        } finally {
            setLoading(false);
        }
    };

    // Format data for charts
    const prepareParticipationRoleData = () => {
        if (!stats) return [];
        return [
            { name: 'As Volunteer', value: stats.activitiesAsVolunteer || 0, color: '#8884d8' },
            { name: 'As Participant', value: stats.activitiesAsParticipant || 0, color: '#82ca9d' },
        ];
    };

    const prepareCategoryData = () => {
        if (!stats?.activitiesByCategory) return [];
        const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];
        return Object.entries(stats.activitiesByCategory || {}).map(([category, count], index) => ({
            name: formatCategoryName(category),
            value: count,
            color: colors[index % colors.length]
        }));
    };

    const prepareMonthlyTrendData = () => {
        if (!stats?.monthlyParticipationTrend) return [];
        return Object.entries(stats.monthlyParticipationTrend).map(([month, count]) => ({
            name: month,
            activities: count,
        }));
    };

    const prepareRecentActivitiesData = () => {
        if (!stats || !stats.recentActivities) return [];

        return stats.recentActivities.map(activity => ({
            id: activity.activityId,
            name: activity.activityName,
            category: formatCategoryName(activity.activityCategory),
            role: formatRoleName(activity.participationRole),
            status: formatStatusName(activity.participationStatus),
            date: new Date(activity.participationDate).toLocaleDateString(),
            hours: activity.hoursSpent,
            score: activity.assessmentScore ? activity.assessmentScore.toFixed(1) : 'N/A'
        }));
    };

    // Helper functions to format enum values
    const formatCategoryName = (category) => {
        if (!category) return '';

        // Map enum values to display names
        const categoryMap = {
            'STUDENT_ORGANIZATION': 'Student Organization',
            'UNIVERSITY': 'University',
            'THIRD_PARTY': 'Third Party'
        };

        return categoryMap[category] || category;
    };

    const formatRoleName = (role) => {
        if (!role) return '';

        const roleMap = {
            'PARTICIPANT': 'Participant',
            'CONTRIBUTOR': 'Contributor'
        };

        return roleMap[role] || role;
    };

    const formatStatusName = (status) => {
        if (!status) return '';

        const statusMap = {
            'UNVERIFIED': 'Unverified',
            'VERIFIED': 'Verified',
            'REJECTED': 'Rejected'
        };

        return statusMap[status] || status;
    };

    // Define columns for DataTable
    const recentActivitiesColumns = [
        { id: 'name', label: 'Activity Name', minWidth: 150 },
        { id: 'category', label: 'Category', minWidth: 120 },
        { id: 'role', label: 'Role', minWidth: 100 },
        { id: 'status', label: 'Status', minWidth: 100 },
        { id: 'date', label: 'Date', minWidth: 100 },
        {
            id: 'hours', label: 'Hours', minWidth: 80, align: 'right',
            format: (value) => value?.toFixed(1) || '0'
        },
        { id: 'score', label: 'Rating', minWidth: 80, align: 'right' }
    ];

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
                <Container maxWidth="xl">
                    {/* Header Section */}
                    <div className="mb-8">
                        <Typography variant="h4" component="h1"
                            className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                            {studentId ? 'Student Participation Analysis' : 'My Participation Analysis'}
                        </Typography>
                        <Typography className="text-gray-600 dark:text-gray-300">
                            View and analyze your participation in activities
                        </Typography>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <Typography className="text-red-800">{error}</Typography>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Student Info Card */}
                    {stats && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                                    <Typography className="text-sm text-blue-600 dark:text-blue-200">Student ID</Typography>
                                    <Typography className="text-2xl font-bold text-blue-800 dark:text-blue-100">
                                        {stats.studentId}
                                    </Typography>
                                </div>
                                <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
                                    <Typography className="text-sm text-purple-600 dark:text-purple-200">Student Name</Typography>
                                    <Typography className="text-2xl font-bold text-purple-800 dark:text-purple-100">
                                        {stats.studentName}
                                    </Typography>
                                </div>
                                <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                                    <Typography className="text-sm text-green-600 dark:text-green-200">Total Score</Typography>
                                    <Typography className="text-2xl font-bold text-green-800 dark:text-green-100">
                                        {stats.totalTrainingScore?.toFixed(1) || '0.0'}
                                    </Typography>
                                </div>
                                <div className="p-4 bg-amber-50 dark:bg-amber-900 rounded-lg">
                                    <Typography className="text-sm text-amber-600 dark:text-amber-200">Total Hours</Typography>
                                    <Typography className="text-2xl font-bold text-amber-800 dark:text-amber-100">
                                        {stats.totalParticipationHours?.toFixed(1) || '0.0'}
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Activity Statistics Cards */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Typography className="text-white text-sm">Total Activities</Typography>
                                        <Typography className="text-white text-3xl font-bold mt-2">
                                            {stats.totalActivitiesParticipated}
                                        </Typography>
                                    </div>
                                    <div className="bg-blue-400 rounded-lg p-3">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="flex justify-between text-white">
                                        <span>As Participant</span>
                                        <span>{stats.activitiesAsParticipant}</span>
                                    </div>
                                    <div className="flex justify-between text-white mt-2">
                                        <span>As Volunteer</span>
                                        <span>{stats.activitiesAsVolunteer}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activities Table with enhanced styling */}
                            {stats.recentActivities && stats.recentActivities.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 col-span-full">
                                    <Typography variant="h6" className="text-gray-800 dark:text-white mb-4">
                                        Recent Activities
                                    </Typography>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Activity
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Category
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Role
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Hours
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Score
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {stats.recentActivities.map((activity) => (
                                                    <tr key={activity.participationId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {activity.activityName}
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                ID: {activity.activityId}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                                {activity.activityCategory.replace(/_/g, ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {activity.participationRole}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                                ${activity.participationStatus === 'VERIFIED'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : activity.participationStatus === 'UNVERIFIED'
                                                                        ? 'bg-yellow-100 text-yellow-800'
                                                                        : 'bg-red-100 text-red-800'}`}>
                                                                {activity.participationStatus}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {activity.hoursSpent?.toFixed(1)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {activity.assessmentScore?.toFixed(1) || 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Charts */}
                    {stats && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-white rounded-lg shadow-md p-4">
                                    <PieChart
                                        data={prepareParticipationRoleData()}
                                        title="Activities by Role"
                                    />
                                </div>
                                <div className="bg-white rounded-lg shadow-md p-4">
                                    <PieChart
                                        data={prepareCategoryData()}
                                        title="Activities by Category"
                                    />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                                <BarChart
                                    data={prepareCategoryData()}
                                    title="Activity Count by Category"
                                    bars={[{ dataKey: 'value', name: 'Activities', color: '#8884d8' }]}
                                />
                            </div>

                            {stats.monthlyParticipationTrend && 
                             Object.keys(stats.monthlyParticipationTrend).length > 0 && (
                                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                                    <LineChart
                                        data={prepareMonthlyTrendData()}
                                        title="Participation Trend (Monthly)"
                                        xAxisDataKey="name"
                                        lines={[
                                            { dataKey: 'activities', name: 'Activities', color: '#8884d8' }
                                        ]}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </Container>
            </div>
        </LocalizationProvider>
    );
};

export default Analysis;
