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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
} from "@mui/material";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import InfoIcon from '@mui/icons-material/Info';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

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
  const [verificationModal, setVerificationModal] = useState({
    open: false,
    participantId: null,
    status: null,
    rejection_reason: "",
    verified_note: "",
  });
  const [detailLogModal, setDetailLogModal] = useState({
    open: false,
    participant: null,
    loading: false,
    error: null,
  });
  const [activityDetails, setActivityDetails] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const fetchActivityDetails = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://localhost:8080/activities/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch activity details');
      }

      const data = await response.json();
      setActivityDetails(data.data);
    } catch (error) {
      console.error('Error fetching activity details:', error);
      setError('Failed to load activity details');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://localhost:8080/activities/${id}/feedbacks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch feedbacks');
      }

      const data = await response.json();
      setFeedbacks(data.data);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    }
  };

  useEffect(() => {
    fetchParticipants();
    fetchActivityDetails();
    fetchFeedbacks();
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

  const handleOpenVerificationModal = (participantId, status) => {
    setVerificationModal({
      open: true,
      participantId,
      status,
      rejection_reason: "",
      verified_note: "",
    });
  };

  const handleCloseVerificationModal = () => {
    setVerificationModal({
      open: false,
      participantId: null,
      status: null,
      rejection_reason: "",
      verified_note: "",
    });
  };

  const handleVerificationSubmit = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const { participantId, status, rejection_reason, verified_note } = verificationModal;

      const response = await fetch(
        `http://localhost:8080/participants/verify`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            participation_id: participantId,
            status: status,
            rejection_reason: status === "REJECTED" ? rejection_reason : null,
            verified_note: status === "VERIFIED" ? verified_note : null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update the local state to reflect the change
      setParticipants(
        participants.map((participant) =>
          participant.id === participantId
            ? { ...participant, participation_status: status }
            : participant
        )
      );

      handleCloseVerificationModal();
    } catch (error) {
      console.error("Error updating participant status:", error);
    }
  };

  const handleRemove = async (participantId) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8080/participant/delete`,
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

  const handleOpenDetailLog = async (participantId) => {
    setDetailLogModal(prev => ({ ...prev, open: true, loading: true, error: null }));
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8080/participants/${participantId}`,
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

      const responseData = await response.json();
      
      if (responseData.status_code !== 200) {
        throw new Error('Failed to fetch participant details');
      }

      setDetailLogModal(prev => ({
        ...prev,
        participant: responseData.data,
        loading: false,
      }));
    } catch (error) {
      console.error("Error fetching participant details:", error);
      setDetailLogModal(prev => ({
        ...prev,
        error: "Failed to load participant details",
        loading: false,
      }));
    }
  };

  const handleCloseDetailLog = () => {
    setDetailLogModal({
      open: false,
      participant: null,
      loading: false,
      error: null,
    });
  };

  // Update the ActionButtons component
  const ActionButtons = ({ participant, onVerify, onRemove }) => {
    const buttons = [];
    
    // Add Detail Log button for all statuses
    buttons.push(
      <Button
        key="detail"
        variant="outlined"
        color="info"
        size="small"
        sx={{ mr: 1 }}
        onClick={() => handleOpenDetailLog(participant.id)}
        startIcon={<InfoIcon />}
      >
        Detail Log
      </Button>
    );

    // Add status-specific buttons
    switch (participant.participation_status) {
      case "UNVERIFIED":
        buttons.push(
          <>
            <Button
              key="verify"
              variant="contained"
              color="primary"
              size="small"
              sx={{ mr: 1 }}
              onClick={() => handleOpenVerificationModal(participant.id, "VERIFIED")}
            >
              Verify
            </Button>
            <Button
              key="reject"
              variant="contained"
              color="error"
              size="small"
              sx={{ mr: 1 }}
              onClick={() => handleOpenVerificationModal(participant.id, "REJECTED")}
            >
              Reject
            </Button>
          </>
        );
        break;
      case "VERIFIED":
        buttons.push(
          <>
            <Button
              key="unverify"
              variant="contained"
              color="warning"
              size="small"
              sx={{ mr: 1 }}
              onClick={() => handleOpenVerificationModal(participant.id, "UNVERIFIED")}
            >
              Unverify
            </Button>
            <Button
              key="reject"
              variant="contained"
              color="error"
              size="small"
              sx={{ mr: 1 }}
              onClick={() => handleOpenVerificationModal(participant.id, "REJECTED")}
            >
              Reject
            </Button>
          </>
        );
        break;
      case "REJECTED":
        buttons.push(
          <>
            <Button
              key="verify"
              variant="contained"
              color="primary"
              size="small"
              sx={{ mr: 1 }}
              onClick={() => handleOpenVerificationModal(participant.id, "VERIFIED")}
            >
              Verify
            </Button>
            <Button
              key="unverify"
              variant="contained"
              color="warning"
              size="small"
              sx={{ mr: 1 }}
              onClick={() => handleOpenVerificationModal(participant.id, "UNVERIFIED")}
            >
              Unverify
            </Button>
          </>
        );
        break;
    }

    // Add Remove button for all statuses
    buttons.push(
      <Button
        key="remove"
        variant="contained"
        color="error"
        size="small"
        onClick={() => onRemove(participant.id)}
      >
        Remove
      </Button>
    );

    return <>{buttons}</>;
  };

  // Update the Dialog title and content based on the action
  const getDialogTitle = (status) => {
    switch (status) {
      case "VERIFIED":
        return "Verify Participant";
      case "REJECTED":
        return "Reject Participant";
      case "UNVERIFIED":
        return "Unverify Participant";
      default:
        return "Update Participant Status";
    }
  };

  const getDialogLabel = (status) => {
    switch (status) {
      case "VERIFIED":
        return "Verification Note";
      case "REJECTED":
        return "Rejection Reason";
      case "UNVERIFIED":
        return "Unverification Reason";
      default:
        return "Note";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Add renderStars function
  const renderStars = (rating) => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Rating
          value={rating}
          readOnly
          precision={0.5}
          icon={<StarIcon fontSize="inherit" />}
          emptyIcon={<StarIcon fontSize="inherit" />}
        />
        <Typography variant="body2" color="text.secondary">
          ({rating.toFixed(1)})
        </Typography>
      </Box>
    );
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
                    onVerify={handleOpenVerificationModal}
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

      <Dialog
        open={verificationModal.open}
        onClose={handleCloseVerificationModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {getDialogTitle(verificationModal.status)}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label={getDialogLabel(verificationModal.status)}
              value={verificationModal.status === "VERIFIED" ? verificationModal.verified_note : verificationModal.rejection_reason}
              onChange={(e) =>
                setVerificationModal((prev) => ({
                  ...prev,
                  [verificationModal.status === "VERIFIED" ? "verified_note" : "rejection_reason"]: e.target.value,
                }))
              }
              required
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVerificationModal}>Cancel</Button>
          <Button
            onClick={handleVerificationSubmit}
            variant="contained"
            color={
              verificationModal.status === "VERIFIED"
                ? "success"
                : verificationModal.status === "REJECTED"
                ? "error"
                : "warning"
            }
          >
            {verificationModal.status === "VERIFIED"
              ? "Verify"
              : verificationModal.status === "REJECTED"
              ? "Reject"
              : "Unverify"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Log Modal */}
      <Dialog
        open={detailLogModal.open}
        onClose={handleCloseDetailLog}
        maxWidth="md"
        fullWidth
        className="participant-detail-dialog"
      >
        <DialogTitle>Participant Details</DialogTitle>
        <DialogContent className="participant-detail-content">
          {detailLogModal.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : detailLogModal.error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {detailLogModal.error}
            </Alert>
          ) : detailLogModal.participant ? (
            <>
              {/* <div className="detail-row">
                <div className="detail-label">Student ID</div>
                <div className="detail-value">{detailLogModal.participant.student_id || 'N/A'}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Identify Code</div>
                <div className="detail-value">{detailLogModal.participant.identify_code || 'N/A'}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Participant Name</div>
                <div className="detail-value">{detailLogModal.participant.participant_name || 'N/A'}</div>
              </div> */}
              {/* <div className="detail-row">
                <div className="detail-label">Major</div>
                <div className="detail-value">{detailLogModal.participant.major || 'N/A'}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Activity</div>
                <div className="detail-value">{detailLogModal.participant.activity_name}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Category</div>
                <div className="detail-value">{detailLogModal.participant.activity_category}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Venue</div>
                <div className="detail-value">{detailLogModal.participant.activity_venue}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Activity Status</div>
                <div className="detail-value">
                  <Chip
                    label={detailLogModal.participant.activity_status}
                    color={getStatusColor(detailLogModal.participant.activity_status)}
                    size="small"
                    className="detail-chip"
                  />
                </div>
              </div> */}
              <div className="detail-row flex justify-between items-center">
                <div className="detail-label">Date Range:</div>
                <div className="detail-value">
                  {formatDate(detailLogModal.participant.start_date)} to {formatDate(detailLogModal.participant.end_date)}
                </div>
              </div>
              <div className="detail-row flex justify-between items-center">
                <div className="detail-label">Registered At:</div>
                <div className="detail-value">
                  {formatDate(detailLogModal.participant.registration_time)}
                </div>
              </div>
              <div className="detail-row  flex justify-between items-center">
                <div className="detail-label">Status:</div>
                <div className="detail-value">
                  <Chip
                    label={detailLogModal.participant.participation_status}
                    color={getStatusColor(detailLogModal.participant.participation_status)}
                    size="small"
                    className="detail-chip"
                  />
                </div>
              </div>
              <div className="detail-row flex justify-between items-center">
                <div className="detail-label">Role:</div>
                <div className="detail-value">
                  <Chip
                    label={detailLogModal.participant.participation_role}
                    color={getRoleColor(detailLogModal.participant.participation_role)}
                    size="small"
                    className="detail-chip"
                  />
                </div>
              </div>
              <div className="detail-row flex justify-between items-center">
                <div className="detail-label">Processed At:</div>
                <div className="detail-value">
                  {detailLogModal.participant.processed_at ? formatDate(detailLogModal.participant.processed_at) : 'N/A'}
                </div>
              </div>
              <div className="detail-row flex justify-between items-center">
                <div className="detail-label">Processed By:</div>
                <div className="detail-value">{detailLogModal.participant.processed_by || 'N/A'}</div>
              </div>
              {detailLogModal.participant.rejection_reason && (
                <div className="detail-row flex justify-between items-center">
                  <div className="detail-label">Rejection Reason:</div>
                  <div className="detail-value">{detailLogModal.participant.rejection_reason}</div>
                </div>
              )}
              {detailLogModal.participant.verified_note && (
                <div className="detail-row flex justify-between items-center">
                  <div className="detail-label">Verification Note:</div>
                  <div className="detail-value">{detailLogModal.participant.verified_note}</div>
                </div>
              )}
            </>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailLog} variant="outlined" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      
      </Box>
  );
};

export default OrganizationParticipantManagement;
