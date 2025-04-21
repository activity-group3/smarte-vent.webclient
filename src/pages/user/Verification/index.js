import React, { useState, useEffect } from "react";
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
  Button,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Pagination,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Verification = () => {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    participationStatus: "",
    activityId: "",
  });

  const fetchParticipants = async () => {
    try {
      const token = localStorage.getItem("access_token");
      let queryString = `page=${page}&size=10&participationRole=CONTRIBUTOR`;

      if (filters.participationStatus) {
        queryString += `&participationStatus=${filters.participationStatus}`;
      }

      const response = await fetch(
        `http://localhost:8080/activities/joined?${queryString}`,
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
        setParticipants(data.data.results);
        setTotalPages(data.data.total_pages);
      } else {
        setError("Failed to fetch participants");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [page, filters]);

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

      if (response.ok) {
        // Refresh the participants list after verification
        fetchParticipants();
      } else {
        setError("Failed to verify participant");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value - 1);
  };

  const handleFilterChange = (event) => {
    setFilters((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
    setPage(0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Verification Management
      </Typography>

      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200, mr: 2 }}>
          <Select
            name="participationStatus"
            value={filters.participationStatus}
            onChange={handleFilterChange}
            displayEmpty
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="VERIFIED">Verified</MenuItem>
            <MenuItem value="UNVERIFIED">Unverified</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Activity Name</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell>Student Code</TableCell>
              <TableCell>Registration Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {participants.map((participant) => (
              <TableRow key={participant.id}>
                <TableCell>{participant.activity_name}</TableCell>
                <TableCell>{participant.student_name}</TableCell>
                <TableCell>{participant.student_code}</TableCell>
                <TableCell>
                  {formatDate(participant.registration_time)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={participant.participation_status}
                    color={
                      participant.participation_status === "VERIFIED"
                        ? "success"
                        : "warning"
                    }
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={participant.participation_status === "VERIFIED"}
                    onClick={() => handleVerify(participant.id)}
                  >
                    Verify
                  </Button>
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

export default Verification;
