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
  Button,
  Pagination,
  Modal,
  IconButton,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import ActivityParticipantManagement from "../Participant-Management/ActivityParticipantManagement";
import CloseIcon from '@mui/icons-material/Close';

const ActivityStatus = {
  PUBLISHED: "PUBLISHED",
  WAITING_TO_START: "WAITING_TO_START",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

const ActivityCategory = {
  THIRD_PARTY: "THIRD_PARTY",
  UNIVERSITY: "UNIVERSITY",
  DEPARTMENT: "DEPARTMENT",
  STUDENT_ORGANIZATION: "STUDENT_ORGANIZATION",
};

const SortFields = {
  START_DATE: "startDate",
  ACTIVITY_NAME: "activityName",
  ACTIVITY_STATUS: "activityStatus",
  ACTIVITY_CATEGORY: "activityCategory",
};

const MyContributorActivity = () => {
  const navigate = useNavigate();
  const { activityId } = useParams();
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1, // 1-based for UI consistency
    size: 10, // Default page size
    totalPages: 0,
  });
  const pageSizeOptions = [5, 10, 15, 20]; // Options for page size
  const [filters, setFilters] = useState({
    status: "",
    category: "",
  });
  const [sorting, setSorting] = useState({
    field: SortFields.START_DATE,
    direction: "desc",
  });

  const handleSortChange = (field) => {
    setSorting((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem("access_token");
      let queryString = `page=${pagination.page - 1}&size=${pagination.size}&sort=${sorting.field},${sorting.direction}`;

      if (filters.status) {
        queryString += `&activity_status=${filters.status}`;
      }
      if (filters.category) {
        queryString += `&activity_category=${filters.category}`;
      }

      const response = await fetch(
        `http://localhost:8080/activities/my-contributor`,
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
        setActivities(data.data.results);
        setPagination(prev => ({ ...prev, totalPages: data.data.total_pages }));
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [pagination.page, pagination.size, filters, sorting]);

  const handlePageChange = (event, value) => {
    setPagination(prev => ({ ...prev, page: value }));
  };

  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePageSizeChange = (event) => {
    const newSize = Number(event.target.value);
    setPagination(prev => ({ 
      ...prev, 
      size: newSize, 
      page: 1 // Reset to first page
    })); 
  };

  const handleEdit = (activityId) => {
    navigate(`/admin/activities/${activityId}/edit`);
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
          setActivities(activities.filter((activity) => activity.id !== activityId));
        }
      } catch (error) {
        console.error("Error removing activity:", error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PUBLISHED":
        return "info";
      case "WAITING_TO_START":
        return "warning";
      case "IN_PROGRESS":
        return "primary";
      case "COMPLETED":
        return "success";
      case "CANCELLED":
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
      case "DEPARTMENT":
        return "info";
      case "STUDENT_ORGANIZATION":
        return "success";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString();
  };

  const handleRowClick = (activityId) => {
    navigate(`/activity/${activityId}/verify`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Contribution
      </Typography>

      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <Select
            value={filters.status}
            onChange={handleFilterChange("status")}
            displayEmpty
          >
            <MenuItem value="">All Status</MenuItem>
            {Object.values(ActivityStatus).map((status) => (
              <MenuItem key={status} value={status}>
                {status.replace(/_/g, " ")}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <Select
            value={filters.category}
            onChange={handleFilterChange("category")}
            displayEmpty
          >
            <MenuItem value="">All Categories</MenuItem>
            {Object.values(ActivityCategory).map((category) => (
              <MenuItem key={category} value={category}>
                {category.replace(/_/g, " ")}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <Select
            value={sorting.field}
            onChange={(e) => handleSortChange(e.target.value)}
            displayEmpty
          >
            <MenuItem value={SortFields.START_DATE}>Sort by Date</MenuItem>
            <MenuItem value={SortFields.ACTIVITY_NAME}>Sort by Name</MenuItem>
            <MenuItem value={SortFields.ACTIVITY_STATUS}>Sort by Status</MenuItem>
            <MenuItem value={SortFields.ACTIVITY_CATEGORY}>Sort by Category</MenuItem>
          </Select>
        </FormControl>

        <Chip
          label={sorting.direction === "asc" ? "↑ Ascending" : "↓ Descending"}
          color="default"
          size="small"
          onClick={() => handleSortChange(sorting.field)}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Venue</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Manage Participant</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activities.map((activity) => (
              <TableRow 
                key={activity.id}
                onClick={() => handleRowClick(activity.id)}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                }}
              >
                <TableCell>{activity.id}</TableCell>
                <TableCell>{activity.activity_name}</TableCell>
                <TableCell>
                  <Chip
                    label={activity.activity_category.replace(/_/g, " ")}
                    color={getCategoryColor(activity.activity_category)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{activity.activity_venue}</TableCell>
                <TableCell>{formatDate(activity.start_date)}</TableCell>
                <TableCell>{formatDate(activity.end_date)}</TableCell>
                <TableCell>
                    <Chip
                      label={activity.activity_status.replace(/_/g, " ")}
                      color={getStatusColor(activity.activity_status)}
                      size="small"
                      sx={{
                        fontWeight: ['IN_PROGRESS', 'PUBLISHED'].includes(activity.activity_status) ? 'bold' : 'normal',
                        fontSize: ['IN_PROGRESS', 'PUBLISHED'].includes(activity.activity_status) ? '0.875rem' : '0.8125rem',
                        boxShadow: ['IN_PROGRESS', 'PUBLISHED'].includes(activity.activity_status) ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
                        '&.MuiChip-colorPrimary': {
                          backgroundColor: '#1976d2',
                          color: 'white',
                        },
                        '&.MuiChip-colorInfo': {
                          backgroundColor: '#0288d1',
                          color: 'white',
                        }
                      }}
                    />
                </TableCell>
                <TableCell>
                  {activity.current_participants}/{activity.capacity_limit}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedActivityId(activity.id);
                      setShowParticipantModal(true);
                    }}
                    sx={{
                      backgroundColor: '#1976d2',
                      '&:hover': {
                        backgroundColor: '#1565c0',
                      },
                    }}
                  >
                    Manage
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <Select
              value={pagination.size}
              onChange={handlePageSizeChange}
              displayEmpty
            >
              {pageSizeOptions.map((sizeOption) => (
                <MenuItem key={sizeOption} value={sizeOption}>
                  {sizeOption} per page
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Pagination
          count={pagination.totalPages}
          page={pagination.page}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
        />
      </Box>

      {/* Participant Management Modal */}
      <Modal
        open={showParticipantModal}
        onClose={() => setShowParticipantModal(false)}
        aria-labelledby="participant-management-modal"
        aria-describedby="participant-management-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '1200px',
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 2,
          overflow: 'auto',
          outline: 'none',
        }}>
          <Box sx={{
            position: 'sticky',
            top: 0,
            bgcolor: 'background.paper',
            zIndex: 1,
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #e0e0e0',
          }}>
            <Typography variant="h6" component="h2">
              Participant Management
            </Typography>
            <IconButton
              onClick={() => setShowParticipantModal(false)}
              size="small"
              sx={{ ml: 2 }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ p: 3 }}>
            {selectedActivityId && (
              <ActivityParticipantManagement
                activityId={selectedActivityId}
                onClose={() => setShowParticipantModal(false)}
              />
            )}
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default MyContributorActivity;
