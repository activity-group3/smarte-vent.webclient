import React, { useState } from "react";
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
} from "@mui/material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ApproveIcon,
  Cancel as DisapproveIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaFilter,
  FaCalendar,
  FaCalendarCheck,
  FaCheck,
} from "react-icons/fa";
import ActivityUpdateForm from "@/components/ActivityUpdateForm";
import { useApiData, useModal, useTableActions } from "@/hooks";
import type { Activity, ActivityFilters, SortField } from "@/types/activityManagement";
import { ActivityStatus, ActivityCategory } from "@/types/entities";

const AdminActivityManageRefactored: React.FC = () => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  // Initialize filters
  const initialFilters: ActivityFilters = {
    activity_name: "",
    status: "",
    activity_category: "",
    startDateFrom: null,
    startDateTo: null,
    endDateFrom: null,
    endDateTo: null,
    min_attendance_score_unit: "",
    max_attendance_score_unit: "",
    min_capacity_limit: "",
    max_capacity_limit: "",
    activity_venue: "",
    fee: "",
    registration_deadline: null,
  };

  // Use hooks
  const {
    data: activities,
    loading,
    error,
    pagination,
    sorting,
    filters,
    refetch,
    handlePageChange,
    handleSortChange,
    updateFilter,
    resetFilters,
    handleInputChange,
    handleSelectChange,
    handleDateChange,
  } = useApiData<Activity, ActivityFilters, SortField>({
    endpoint: "http://localhost:8080/activities/search",
    initialFilters,
    initialSortField: "startDate",
    initialSortDirection: "desc",
    initialPageSize: 20,
  });

  const updateModal = useModal<Activity>();
  const tableActions = useTableActions<Activity>({ onRefresh: refetch });

  // Event handlers
  const handleEdit = async (activityId: number) => {
    try {
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
        updateModal.open(data.data);
      }
    } catch (error) {
      console.error("Error fetching activity details:", error);
    }
  };

  const handleApprovalToggle = async (
    activityId: number,
    currentApprovalStatus: boolean
  ) => {
    const endpoint = currentApprovalStatus 
      ? `http://localhost:8080/activities/${activityId}/disapprove`
      : `http://localhost:8080/activities/${activityId}/approve`;
    
    await tableActions.handleApiCall(endpoint, 'POST');
  };

  const handleRemove = async (activityId: number) => {
    await tableActions.handleDelete(
      `http://localhost:8080/activities/${activityId}`,
      activityId
    );
  };

  const handleUpdateSuccess = async (updatedActivity: unknown) => {
    const success = await tableActions.handleUpdate(
      "http://localhost:8080/activities/update",
      updatedActivity
    );
    if (success) {
      updateModal.close();
    }
  };

  const handleRowClick = (activityId: number) => {
    navigate(`/admin/activities/${activityId}`);
  };

  // Utility functions
  const getStatusColor = (status: string) => {
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

  const getCategoryColor = (category: string) => {
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

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString();
  };

  if (loading && activities.length === 0) {
    return (
      //@ts-ignore
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </Box>
    );
  }

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
          {updateModal.isOpen ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6">
              <Typography variant="h5" className="mb-6">
                Update Activity
              </Typography>
              <ActivityUpdateForm
                activity={updateModal.data}
                onSubmit={handleUpdateSuccess}
                onCancel={updateModal.close}
              />
            </div>
          ) : (
            <>
              {/* Statistics Cards */}
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
                    {activities.filter((a) => a.activity_status === "IN_PROGRESS").length}
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
                    {activities.filter((a) => a.activity_status === "COMPLETED").length}
                  </p>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                  <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-lg hover:scale-[1.01] transition-all duration-300 flex-1">
                    <TextField
                      fullWidth
                      label="Search Activity Name"
                      variant="outlined"
                      size="medium"
                      className="bg-white dark:bg-slate-700 rounded-lg"
                      value={filters.activity_name}
                      onChange={handleInputChange("activity_name")}
                      InputProps={{
                        startAdornment: (
                          <FaSearch className="mr-2 text-gray-400" />
                        ),
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

                <Collapse in={showFilters} timeout="auto" unmountOnExit className="mt-4">
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl
                        fullWidth
                        variant="outlined"
                        size="small"
                        className="bg-white dark:bg-slate-700 rounded-lg"
                      >
                        <InputLabel>Activity Status</InputLabel>
                        <Select
                          value={filters.status}
                          onChange={handleSelectChange("status")}
                          label="Activity Status"
                        >
                          <MenuItem value="">
                            <em>All Statuses</em>
                          </MenuItem>
                          {Object.values(ActivityStatus).map((status) => (
                            <MenuItem key={status} value={status}>
                              {(status as string).replace(/_/g, " ")}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl
                        fullWidth
                        variant="outlined"
                        size="small"
                        className="bg-white dark:bg-slate-700 rounded-lg"
                      >
                        <InputLabel>Activity Category</InputLabel>
                        <Select
                          value={filters.activity_category}
                          onChange={handleSelectChange("activity_category")}
                          label="Activity Category"
                        >
                          <MenuItem value="">
                            <em>All Categories</em>
                          </MenuItem>
                          {Object.values(ActivityCategory).map((category) => (
                            <MenuItem key={category} value={category}>
                              {(category as string).replace(/_/g, " ")}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Date Range Filters */}
                    <Grid item xs={12} sm={6} md={4}>
                      <DateTimePicker
                        label="Start Date From"
                        value={filters.startDateFrom}
                        onChange={handleDateChange("startDateFrom")}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                            className: "bg-white dark:bg-slate-700 rounded-lg"
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <DateTimePicker
                        label="Start Date To"
                        value={filters.startDateTo}
                        onChange={handleDateChange("startDateTo")}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                            className: "bg-white dark:bg-slate-700 rounded-lg"
                          }
                        }}
                      />
                    </Grid>

                    {/* Clear Filters Button */}
                    <Grid item xs={12} className="flex justify-end">
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={resetFilters}
                        className="mr-2"
                      >
                        Clear All Filters
                      </Button>
                    </Grid>
                  </Grid>
                </Collapse>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {/* Activities Table */}
              <TableContainer
                component={Paper}
                className="shadow-lg rounded-2xl overflow-hidden bg-white dark:bg-slate-800"
              >
                <Table>
                  <TableHead>
                    <TableRow className="bg-blue-600">
                      <TableCell 
                        className="text-white font-semibold cursor-pointer"
                        onClick={() => handleSortChange("activityName")}
                      >
                        Name
                        {sorting.field === "activityName" && (
                          <span className="ml-1">{sorting.direction === "asc" ? "▲" : "▼"}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-white font-semibold">Category</TableCell>
                      <TableCell className="text-white font-semibold">Venue</TableCell>
                      <TableCell 
                        className="text-white font-semibold cursor-pointer"
                        onClick={() => handleSortChange("startDate")}
                      >
                        Start Date
                        {sorting.field === "startDate" && (
                          <span className="ml-1">{sorting.direction === "asc" ? "▲" : "▼"}</span>
                        )}
                      </TableCell>
                      <TableCell 
                        className="text-white font-semibold cursor-pointer"
                        onClick={() => handleSortChange("endDate")}
                      >
                        End Date
                        {sorting.field === "endDate" && (
                          <span className="ml-1">{sorting.direction === "asc" ? "▲" : "▼"}</span>
                        )}
                      </TableCell>
                      <TableCell 
                        className="text-white font-semibold cursor-pointer"
                        onClick={() => handleSortChange("activityStatus")}
                      >
                        Status
                        {sorting.field === "activityStatus" && (
                          <span className="ml-1">{sorting.direction === "asc" ? "▲" : "▼"}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-white font-semibold">Capacity</TableCell>
                      <TableCell className="text-white font-semibold">Actions</TableCell>
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
                          {activity.activity_name}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={activity.activity_category.replace(/_/g, " ")}
                            color={getCategoryColor(activity.activity_category) as any}
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
                            color={getStatusColor(activity.activity_status) as any}
                            className="font-medium"
                          />
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {activity.current_participants}/{activity.capacity_limit}
                        </TableCell>
                        <TableCell>
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
                          <IconButton
                            size="small"
                            color={activity.is_approved ? "error" : "success"}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprovalToggle(activity.id, activity.is_approved);
                            }}
                            className={`mr-2 ${
                              activity.is_approved
                                ? "hover:bg-red-100"
                                : "hover:bg-green-100"
                            }`}
                            title={
                              activity.is_approved
                                ? "Disapprove Activity"
                                : "Approve Activity"
                            }
                          >
                            {activity.is_approved ? <DisapproveIcon /> : <ApproveIcon />}
                          </IconButton>
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <Box className="mt-6 flex justify-center">
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  onChange={handlePageChange}
                  color="primary"
                  className="bg-white shadow-sm rounded-lg p-2"
                />
              </Box>
            </>
          )}
        </Box>
      </div>
    </LocalizationProvider>
  );
};

export default AdminActivityManageRefactored; 
