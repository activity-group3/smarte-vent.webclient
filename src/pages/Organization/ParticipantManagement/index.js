import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  TextField,
  Button,
  Chip,
  Pagination,
  CircularProgress,
  Alert,
  Grid,
  IconButton,
} from "@mui/material";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const ParticipationStatus = {
  UNVERIFIED: "UNVERIFIED",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
};

const ParticipationRole = {
  PARTICIPANT: "PARTICIPANT",
  CONTRIBUTOR: "CONTRIBUTOR",
};

const SortFields = {
  REGISTRATION_TIME: "registeredAt",
  IDENTIFY_CODE: "identifyCode",
  PARTICIPANT_NAME: "participantName",
  START_DATE: "startDate",
  END_DATE: "endDate",
};

const getStatusColor = (status) => {
  switch (status) {
    case "VERIFIED":
      return "success";
    case "UNVERIFIED":
      return "warning";
    case "REJECTED":
      return "error";
    default:
      return "default";
  }
};

const getRoleColor = (role) => {
  switch (role) {
    case "COMMITTEE":
      return "primary";
    case "PARTICIPANT":
      return "info";
    default:
      return "default";
  }
};

const OrganizationParticipantManagement = () => {
  const { id } = useParams();
  const [participants, setParticipants] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    participationStatus: "",
    participationRole: "",
    registeredAfter: "",
    registeredBefore: "",
    identifyCode: "",
    participantName: "",
  });
  const [sorting, setSorting] = useState({
    field: SortFields.REGISTRATION_TIME,
    direction: "desc",
  });

  const handleSortChange = (newField) => {
    // If the field changes, default to 'asc' or keep current direction if preferred
    const newDirection = sorting.field === newField ? (sorting.direction === "asc" ? "desc" : "asc") : 'asc';
    setSorting({ field: newField, direction: newDirection });
    setPage(0); // Reset to first page on sort field change
  };

  const toggleSortDirection = () => {
    setSorting(prevSorting => ({
      ...prevSorting,
      direction: prevSorting.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPage(0); // Reset to first page on sort direction change
  };

  const fetchParticipants = async () => {
    try {
      const token = localStorage.getItem("access_token");

      let queryString = `activityId=${id}&page=${page}&size=20&sort=${sorting.field},${sorting.direction}`;

      if (filters.participationStatus) {
        queryString += `&participationStatus=${filters.participationStatus}`; // Changed from participationStatus to status
      }
      if (filters.participationRole) {
        queryString += `&participationRole=${filters.participationRole}`; // Changed from participationRole to role
      }

      if (filters.registeredAfter) {
        queryString += `&registeredAfter=${new Date(
          filters.registeredAfter
        ).toISOString()}`;
      }

      if (filters.registeredBefore) {
        queryString += `&registeredBefore=${new Date(
          filters.registeredBefore
        ).toISOString()}`;
      }
      if (filters.identifyCode) {
        queryString += `&identifyCode=${filters.identifyCode}`;
      }
      if (filters.participantName) {
        queryString += `&participantName=${filters.participantName}`;
      }

      const response = await fetch(
        `http://localhost:8080/participants?${queryString}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setParticipants(data.data.results);
      setTotalPages(data.data.total_pages);
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  useEffect(() => {
    fetchParticipants();
    console.log(participants);
  }, [id, page, filters, sorting]);

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

  const handleVerify = async (participantId) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8080/participants/${participantId}/verify`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update the local state to reflect the change
      setParticipants(
        participants.map((participant) =>
          participant.id === participantId
            ? { ...participant, participation_status: "VERIFIED" }
            : participant
        )
      );
    } catch (error) {
      console.error("Error verifying participant:", error);
    }
  };

  const handleRemove = async (participantId) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8080/participants/${participantId}/delete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Remove the participant from the local state
      setParticipants(participants.filter((p) => p.id !== participantId));
    } catch (error) {
      console.error("Error removing participant:", error);
    }
  };

  // Add this action button cell component
  const ActionButtons = ({ participant, onVerify, onRemove }) => {
    switch (participant.participation_status) {
      case "UNVERIFIED":
        return (
          <>
            <Button
              variant="contained"
              color="primary"
              size="small"
              sx={{ mr: 1 }}
              onClick={() => onVerify(participant.id)}
            >
              Verify
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => onRemove(participant.id)}
            >
              Remove
            </Button>
          </>
        );
      case "VERIFIED":
        return (
          <>
            <Chip
              label="Verified"
              color="success"
              size="small"
              sx={{ mr: 1 }}
            />
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => onRemove(participant.id)}
            >
              Remove
            </Button>
          </>
        );
      case "REJECTED":
        return (
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => onRemove(participant.id)}
          >
            Remove
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Participant Management
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <Select
              value={filters.participationStatus}
              onChange={handleFilterChange("participationStatus")}
              displayEmpty
            >
              <MenuItem value=""><em>All Statuses</em></MenuItem>
              {Object.values(ParticipationStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <Select
              value={filters.participationRole}
              onChange={handleFilterChange("participationRole")}
              displayEmpty
            >
              <MenuItem value=""><em>All Roles</em></MenuItem>
              {Object.values(ParticipationRole).map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            size="small"
            type="datetime-local"
            label="Registered After"
            value={filters.registeredAfter}
            onChange={handleFilterChange("registeredAfter")}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            size="small"
            type="datetime-local"
            label="Registered Before"
            value={filters.registeredBefore}
            onChange={handleFilterChange("registeredBefore")}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Identify Code"
            value={filters.identifyCode}
            onChange={handleFilterChange("identifyCode")}
            placeholder="Enter identify code"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Participant Name"
            value={filters.participantName}
            onChange={handleFilterChange("participantName")}
            placeholder="Enter name"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControl fullWidth size="small" sx={{ mr: 1 }}>
            <Select
              value={sorting.field}
              onChange={(e) => handleSortChange(e.target.value)}
              displayEmpty
            >
              <MenuItem value={SortFields.REGISTRATION_TIME}>
                Sort: Registration Time
              </MenuItem>
              <MenuItem value={SortFields.IDENTIFY_CODE}>
                Sort: Identify Code
              </MenuItem>
              <MenuItem value={SortFields.PARTICIPANT_NAME}>
                Sort: Participant Name
              </MenuItem>
            </Select>
          </FormControl>
          <IconButton onClick={toggleSortDirection} size="small">
            {sorting.direction === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
          </IconButton>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Identify Code</TableCell>
              <TableCell>Participant Name</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Registration Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {participants.map((participant) => (
              <TableRow key={participant.id}>
                <TableCell>{participant.id}</TableCell>
                <TableCell>{participant.identify_code}</TableCell>
                <TableCell>{participant.participant_name}</TableCell>
                {/* <TableCell>{participant.activity_venue}</TableCell> */}
                <TableCell>
                  {new Date(participant.start_date).toLocaleString()}
                </TableCell>
                <TableCell>
                  {new Date(participant.end_date).toLocaleString()}
                </TableCell>
                <TableCell>
                  {new Date(participant.registration_time).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={participant.participation_status}
                    color={getStatusColor(participant.participation_status)}
                    size="small"
                    sx={{ fontWeight: "medium" }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={participant.participation_role}
                    color={getRoleColor(participant.participation_role)}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: "medium" }}
                  />
                </TableCell>
                <TableCell>
                  <ActionButtons
                    participant={participant}
                    onVerify={handleVerify}
                    onRemove={handleRemove}
                  />
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

export default OrganizationParticipantManagement;
