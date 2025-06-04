import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import ActivityParticipantManagement from "./ActivityParticipantManagement";



const ParticipantManage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // If no activity ID is provided, redirect to dashboard
  useEffect(() => {
    if (!id) {
      navigate('/dashboard');
    } else {
      fetchActivity();
    }
  }, [id, navigate]);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8080/activities/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.status_code === 200) {
        setActivity(data.data);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {activity && (
        <ActivityParticipantManagement
          activityId={id}
          onClose={handleCloseModal}
        />
      )}
    </Container>
  );
};

export default ParticipantManage;
