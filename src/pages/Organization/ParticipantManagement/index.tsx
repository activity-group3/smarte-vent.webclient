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
  SelectChangeEvent,
} from "@mui/material";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import InfoIcon from '@mui/icons-material/Info';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

enum ParticipationStatus {
  UNVERIFIED = "UNVERIFIED",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

enum ParticipationRole {
  PARTICIPANT = "PARTICIPANT",
  CONTRIBUTOR = "CONTRIBUTOR",
}

enum SortFields {
  REGISTRATION_TIME = "registeredAt",
  IDENTIFY_CODE = "identifyCode",
  PARTICIPANT_NAME = "participantName",
  START_DATE = "startDate",
  END_DATE = "endDate",
}

type SortDirection = "asc" | "desc";

interface Participant {
  id: number;
  identify_code: string;
  participant_name: string;
  start_date: string;
  end_date: string;
  registration_time: string;
  participation_status: ParticipationStatus;
  participation_role: ParticipationRole;
  processed_at?: string;
  processed_by?: string;
  rejection_reason?: string;
  verified_note?: string;
}

interface Filters {
  participationStatus: string;
  participationRole: string;
  registeredAfter: string;
  registeredBefore: string;
  identifyCode: string;
  participantName: string;
}

interface Sorting {
  field: SortFields;
  direction: SortDirection;
}

interface VerificationModal {
  open: boolean;
  participantId: number | null;
  status: ParticipationStatus | null;
  rejection_reason: string;
  verified_note: string;
}

interface DetailLogModal {
  open: boolean;
  participant: Participant | null;
  loading: boolean;
  error: string | null;
}

interface ActivityDetails {
  id: number;
  name: string;
  category: string;
  venue: string;
  status: string;
  start_date: string;
  end_date: string;
}

interface Feedback {
  id: number;
  rating: number;
  comment: string;
  participant_name: string;
  created_at: string;
}

interface ApiResponse<T> {
  status_code: number;
  data: T;
}

interface ParticipantsResponse {
  results: Participant[];
  total_pages: number;
}

interface ActionButtonsProps {
  participant: Participant;
  onVerify: (participantId: number, status: ParticipationStatus) => void;
  onRemove: (participantId: number) => void;
}

const getStatusColor = (status: string): "success" | "warning" | "error" | "default" => {
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

const getRoleColor = (role: string): "primary" | "info" | "default" => {
  switch (role) {
    case "COMMITTEE":
      return "primary";
    case "PARTICIPANT":
      return "info";
    default:
      return "default";
  }
};

export default function OrganizationParticipantManagement() {
  const { id } = useParams<{ id: string }>();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [filters, setFilters] = useState<Filters>({
    participationStatus: "",
    participationRole: "",
    registeredAfter: "",
    registeredBefore: "",
    identifyCode: "",
    participantName: "",
  });
  const [sorting, setSorting] = useState<Sorting>({
    field: SortFields.REGISTRATION_TIME,
    direction: "desc",
  });
  const [verificationModal, setVerificationModal] = useState<VerificationModal>({
    open: false,
    participantId: null,
    status: null,
    rejection_reason: "",
    verified_note: "",
  });
  const [detailLogModal, setDetailLogModal] = useState<DetailLogModal>({
    open: false,
    participant: null,
    loading: false,
    error: null,
  });
  const [activityDetails, setActivityDetails] = useState<ActivityDetails | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleSortChange = (newField: SortFields): void => {
    // If the field changes, default to 'asc' or keep current direction if preferred
    const newDirection: SortDirection = sorting.field === newField ? (sorting.direction === "asc" ? "desc" : "asc") : 'asc';
    setSorting({ field: newField, direction: newDirection });
    setPage(0); // Reset to first page on sort field change
  };

  const toggleSortDirection = (): void => {
    setSorting(prevSorting => ({
      ...prevSorting,
      direction: prevSorting.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPage(0); // Reset to first page on sort direction change
  };

  const fetchParticipants = async (): Promise<void> => {
    if (!id) return;

    try {
      const token = localStorage.getItem("access_token");

      let queryString = `activityId=${id}&page=${page}&size=20&sort=${sorting.field},${sorting.direction}`;

      if (filters.participationStatus) {
        queryString += `&participationStatus=${filters.participationStatus}`;
      }
      if (filters.participationRole) {
        queryString += `&participationRole=${filters.participationRole}`;
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

      const data: ApiResponse<ParticipantsResponse> = await response.json();
      setParticipants(data.data.results);
      setTotalPages(data.data.total_pages);
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  const fetchActivityDetails = async (): Promise<void> => {
    if (!id) return;

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

      const data: ApiResponse<ActivityDetails> = await response.json();
      setActivityDetails(data.data);
    } catch (error) {
      console.error('Error fetching activity details:', error);
      setError('Failed to load activity details');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async (): Promise<void> => {
    if (!id) return;

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

      const data: ApiResponse<Feedback[]> = await response.json();
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

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number): void => {
    setPage(value - 1);
  };

  const handleFilterChange = (field: keyof Filters) => (event: SelectChangeEvent): void => {
    setFilters((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    setPage(0);
  };

  const handleTextFilterChange = (field: keyof Filters) => (event: React.ChangeEvent<HTMLInputElement>): void => {
    setFilters((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    setPage(0);
  };

  const handleOpenVerificationModal = (participantId: number, status: ParticipationStatus): void => {
    setVerificationModal({
      open: true,
      participantId,
      status,
      rejection_reason: "",
      verified_note: "",
    });
  };

  const handleCloseVerificationModal = (): void => {
    setVerificationModal({
      open: false,
      participantId: null,
      status: null,
      rejection_reason: "",
      verified_note: "",
    });
  };

  const handleVerificationSubmit = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("access_token");
      const { participantId, status, rejection_reason, verified_note } = verificationModal;

      if (!participantId || !status) return;

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
            rejection_reason: status === ParticipationStatus.REJECTED ? rejection_reason : null,
            verified_note: status === ParticipationStatus.VERIFIED ? verified_note : null,
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

  const handleRemove = async (participantId: number): Promise<void> => {
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

  const handleOpenDetailLog = async (participantId: number): Promise<void> => {
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

      const responseData: ApiResponse<Participant> = await response.json();
      
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

  const handleCloseDetailLog = (): void => {
    setDetailLogModal({
      open: false,
      participant: null,
      loading: false,
      error: null,
    });
  };

  // Update the ActionButtons component
  const ActionButtons: React.FC<ActionButtonsProps> = ({ participant, onVerify, onRemove }) => {
    const buttons: React.ReactNode[] = [];
    
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
      case ParticipationStatus.UNVERIFIED:
        buttons.push(
          <React.Fragment key="unverified-actions">
            <Button
              key="verify"
              variant="contained"
              color="primary"
              size="small"
              sx={{ mr: 1 }}
              onClick={() => handleOpenVerificationModal(participant.id, ParticipationStatus.VERIFIED)}
            >
              Verify
            </Button>
            <Button
              key="reject"
              variant="contained"
              color="error"
              size="small"
              sx={{ mr: 1 }}
              onClick={() => handleOpenVerificationModal(participant.id, ParticipationStatus.REJECTED)}
            >
              Reject
            </Button>
          </React.Fragment>
        );
        break;
      case ParticipationStatus.VERIFIED:
        buttons.push(
          <React.Fragment key="verified-actions">
            <Button
              key="unverify"
              variant="contained"
              color="warning"
              size="small"
              sx={{ mr: 1 }}
              onClick={() => handleOpenVerificationModal(participant.id, ParticipationStatus.UNVERIFIED)}
            >
              Unverify
            </Button>
            <Button
              key="reject"
              variant="contained"
              color="error"
              size="small"
              sx={{ mr: 1 }}
              onClick={() => handleOpenVerificationModal(participant.id, ParticipationStatus.REJECTED)}
            >
              Reject
            </Button>
          </React.Fragment>
        );
        break;
      case ParticipationStatus.REJECTED:
        buttons.push(
          <React.Fragment key="rejected-actions">
            <Button
              key="verify"
              variant="contained"
              color="primary"
              size="small"
              sx={{ mr: 1 }}
              onClick={() => handleOpenVerificationModal(participant.id, ParticipationStatus.VERIFIED)}
            >
              Verify
            </Button>
            <Button
              key="unverify"
              variant="contained"
              color="warning"
              size="small"
              sx={{ mr: 1 }}
              onClick={() => handleOpenVerificationModal(participant.id, ParticipationStatus.UNVERIFIED)}
            >
              Unverify
            </Button>
          </React.Fragment>
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
  const getDialogTitle = (status: ParticipationStatus | null): string => {
    switch (status) {
      case ParticipationStatus.VERIFIED:
        return "Verify Participant";
      case ParticipationStatus.REJECTED:
        return "Reject Participant";
      case ParticipationStatus.UNVERIFIED:
        return "Unverify Participant";
      default:
        return "Update Participant Status";
    }
  };

  const getDialogLabel = (status: ParticipationStatus | null): string => {
    switch (status) {
      case ParticipationStatus.VERIFIED:
        return "Verification Note";
      case ParticipationStatus.REJECTED:
        return "Rejection Reason";
      case ParticipationStatus.UNVERIFIED:
        return "Unverification Reason";
      default:
        return "Note";
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  // Add renderStars function
  const renderStars = (rating: number): React.ReactNode => {
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
    // @ts-ignore
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
            onChange={handleTextFilterChange("registeredAfter")}
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
            onChange={handleTextFilterChange("registeredBefore")}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Identify Code"
            value={filters.identifyCode}
            onChange={handleTextFilterChange("identifyCode")}
            placeholder="Enter identify code"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Participant Name"
            value={filters.participantName}
            onChange={handleTextFilterChange("participantName")}
            placeholder="Enter name"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControl fullWidth size="small" sx={{ mr: 1 }}>
            <Select
              value={sorting.field}
              onChange={(e) => handleSortChange(e.target.value as SortFields)}
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
              value={verificationModal.status === ParticipationStatus.VERIFIED ? verificationModal.verified_note : verificationModal.rejection_reason}
              onChange={(e) =>
                setVerificationModal((prev) => ({
                  ...prev,
                  [verificationModal.status === ParticipationStatus.VERIFIED ? "verified_note" : "rejection_reason"]: e.target.value,
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
              verificationModal.status === ParticipationStatus.VERIFIED
                ? "success"
                : verificationModal.status === ParticipationStatus.REJECTED
                ? "error"
                : "warning"
            }
          >
            {verificationModal.status === ParticipationStatus.VERIFIED
              ? "Verify"
              : verificationModal.status === ParticipationStatus.REJECTED
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
              <div className="detail-row flex justify-between items-center">
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
