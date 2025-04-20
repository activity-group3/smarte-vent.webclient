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
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const ActivityStatus = {
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

const AdminActivityManage = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
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

      const response = await fetch(
        `http://localhost:8080/activities?${queryString}`,
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
        setTotalPages(data.data.total_pages);
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
      case "WAITING_TO_START":
        return "warning";
      case "IN_PROGRESS":
        return "info";
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
    navigate(`/admin/activities/${activityId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Activity Management
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
              <TableCell>Actions</TableCell>
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
                  />
                </TableCell>
                <TableCell>
                  {activity.capacity}/{activity.capacity_limit}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click when clicking buttons
                      handleEdit(activity.id);
                    }}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click when clicking buttons
                      handleRemove(activity.id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
        <Pagination
          count={totalPages}
          page={page + 1}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default AdminActivityManage;
