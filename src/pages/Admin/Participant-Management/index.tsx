import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
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
  TextField,
  Button,
  Pagination,
  Chip,
} from "@mui/material";
import type { ChipProps, SelectChangeEvent } from "@mui/material";

// ------------------------------------------------------------
// Types & Constants
// ------------------------------------------------------------

export type ParticipationStatus = "UNVERIFIED" | "VERIFIED" | "REJECTED";

export type ParticipationRole =
  | "PARTICIPANT"
  | "CONTRIBUTOR"
  | "COMMITTEE";

// Data model for a participant (adjust field names if the API differs)
export interface Participant {
  id: number;
  identify_code?: string;
  participant_name: string;
  activity_venue: string;
  start_date: string;
  end_date: string;
  registration_time: string;
  participation_status: ParticipationStatus;
  participation_role: ParticipationRole;
}

export const ParticipationStatusConst: Record<
  ParticipationStatus,
  ParticipationStatus
> = {
  UNVERIFIED: "UNVERIFIED",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
};

export const ParticipationStatusArray: ParticipationStatus[] = [
  "UNVERIFIED",
  "VERIFIED",
  "REJECTED",
];

export const ParticipationRoleConst: Record<ParticipationRole, ParticipationRole> = {
  PARTICIPANT: "PARTICIPANT",
  CONTRIBUTOR: "CONTRIBUTOR",
  COMMITTEE: "COMMITTEE",
};

export const ParticipationRoleArray: ParticipationRole[] = [
  "PARTICIPANT",
  "CONTRIBUTOR",
  "COMMITTEE",
];

export const SortFields = {
  REGISTRATION_TIME: "registeredAt",
  ID: "id",
  IDENTIFY_CODE: "identifyCode",
} as const;
// Values of SortFields ("registeredAt" | "id" | "identifyCode")
export type SortField = (typeof SortFields)[keyof typeof SortFields];

const getStatusColor = (status: ParticipationStatus): ChipProps["color"] => {
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

const getRoleColor = (role: ParticipationRole): ChipProps["color"] => {
  switch (role) {
    case "COMMITTEE":
      return "primary";
    case "PARTICIPANT":
      return "info";
    default:
      return "default";
  }
};

type FilterChangeEvent =
  | SelectChangeEvent
  | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

const AdminParticipantManage: React.FC = () => {
  const { id } = useParams();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<Record<string, string>>({
    participationStatus: "",
    participationRole: "",
    registeredAfter: "",
    registeredBefore: "",
    studentCode: "",
    participantName: "",
  });
  const [sorting, setSorting] = useState<{
    field: (typeof SortFields)[keyof typeof SortFields];
    direction: "asc" | "desc";
  }>({
    field: SortFields.REGISTRATION_TIME,
    direction: "desc",
  });

  const handleSortChange = (
    field: (typeof SortFields)[keyof typeof SortFields]
  ) => {
    setSorting((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    setPage(0);
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
      if (filters.studentCode) {
        queryString += `&studentCode=${filters.studentCode}`;
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

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1);
  };

  const handleFilterChange = (field: keyof typeof filters) =>
    (event: FilterChangeEvent) => {
      const value = (event.target as HTMLInputElement).value as string;
      setFilters((prev) => ({
        ...prev,
        [field]: value,
      }) as typeof filters);
      setPage(0);
    };

  const handleVerify = async (participantId: number) => {
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
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === participantId
            ? ({ ...p, participation_status: "VERIFIED" } as Participant)
            : p
        )
      );
    } catch (error) {
      console.error("Error verifying participant:", error);
    }
  };

  const handleRemove = async (participantId: number) => {
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
  const ActionButtons: React.FC<{
    participant: Participant;
    onVerify: (id: number) => void;
    onRemove: (id: number) => void;
  }> = ({ participant, onVerify, onRemove }) => {
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

      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <Select
            value={filters.participationStatus}
            onChange={handleFilterChange("participationStatus")}
            displayEmpty
            placeholder="Status"
          >
            <MenuItem value="">All Status</MenuItem>
            {ParticipationStatusArray.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <Select
            value={filters.participationRole}
            onChange={handleFilterChange("participationRole")}
            displayEmpty
          >
            <MenuItem value="">All Roles</MenuItem>
            {ParticipationRoleArray.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          type="datetime-local"
          label="Registered After"
          value={filters.registeredAfter}
          onChange={handleFilterChange("registeredAfter")}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          type="datetime-local"
          label="Registered Before"
          value={filters.registeredBefore}
          onChange={handleFilterChange("registeredBefore")}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Student Code"
          value={filters.studentCode}
          onChange={handleFilterChange("studentCode")}
          placeholder="Enter student code"
          size="small"
        />

        <TextField
          label="Participant Name"
          value={filters.participantName}
          onChange={handleFilterChange("participantName")}
          placeholder="Enter name"
          size="small"
        />

        <FormControl sx={{ minWidth: 200 }}>
          <Select
            value={sorting.field}
            onChange={(e) => handleSortChange(e.target.value as SortField)}
            displayEmpty
          >
            <MenuItem value={SortFields.REGISTRATION_TIME}>
              Sort by Registration Time
            </MenuItem>
            <MenuItem value={SortFields.ID}>Sort by ID</MenuItem>
            <MenuItem value={SortFields.IDENTIFY_CODE}>
              Sort by Student Code
            </MenuItem>
          </Select>
        </FormControl>

        <Chip
          label={sorting.direction === "asc" ? "↑ Ascending" : "↓ Descending"}
          color="default"
          size="medium"
          onClick={() => handleSortChange(sorting.field)}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Student Code</TableCell>
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
                <TableCell>{participant.activity_venue}</TableCell>
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

export default AdminParticipantManage;
