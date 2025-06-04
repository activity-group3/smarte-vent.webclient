import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaTag,
  FaDollarSign,
  FaBuilding,
} from "react-icons/fa";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Rating,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { FaStar } from "react-icons/fa";
import { account } from "@/Context/user";

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const [participationRole, setParticipationRole] = useState("PARTICIPANT");
  const [openJoinDialog, setOpenJoinDialog] = useState(false);
  const [isParticipating, setIsParticipating] = useState(false);
  const [participationId, setParticipationId] = useState(account.id);
  const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    rating: 0, // 0-10 scale
    feedback_description: ''
  });
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  useEffect(() => {
    fetchActivityDetail();
  }, [id]);
  
  const checkIfJoined = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch('http://localhost:8080/activities/is-joined', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activity_id: parseInt(id)
        }),
      });
      
      const data = await response.json();
      console.log('Check joined response:', data); // Debug log
      
      if (response.ok) {
        const isJoined = data.data?.is_joined || false;
        setIsParticipating(isJoined);
        
        // Update participation ID if available, even if is_joined is false
        if (data.data?.participation_id) {
          console.log('Setting participation ID:', data.data.participation_id); // Debug log
          setParticipationId(data.data.participation_id);
        }
      } else {
        console.error('Error checking join status:', data.message);
      }
    } catch (err) {
      console.error('Network error checking join status:', err);
    }
  };

  const fetchActivityDetail = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://localhost:8080/activities/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.status_code === 200) {
        setActivity(data.data);
        // Check if user is already participating
        const isParticipating = data.data.is_participating || false;
        // setIsParticipating(isParticipating);
        
        // If participating, fetch participation ID
        if (isParticipating) {
          await fetchParticipationId();
        }
      } else {
        setError("Failed to fetch activity details");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkIfJoined();
  }, []);

  const handleOpenJoinDialog = () => {
    setOpenJoinDialog(true);
    setJoinError(null);
  };

  const handleCloseJoinDialog = () => {
    setOpenJoinDialog(false);
    setJoinError(null);
  };

  const handleRoleChange = (event) => {
    setParticipationRole(event.target.value);
  };

  const fetchParticipationId = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://localhost:8080/participations/activity/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.status_code === 200 && data.data && data.data.length > 0) {
        setParticipationId(data.data[0].id);
      }
    } catch (err) {
      console.error("Error fetching participation ID:", err);
    }
  };

  const handleJoinActivity = async () => {
    setJoining(true);
    setJoinError(null);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://localhost:8080/activities/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activity_id: parseInt(id),
          role: participationRole,
        }),
      });

      const data = await response.json();
      console.log('Join activity response:', data); // Debug log
      
      if (response.ok) {
        // First, update the local state
        setIsParticipating(true);
        
        // Store the participation ID from the response if available
        if (data.data) {
          // Try different possible field names for participation ID
          const participationId = data.data.participation_id || 
                                 data.data.id || 
                                 (data.data.data && data.data.data.participation_id);
                                  
          if (participationId) {
            console.log('Setting participation ID from join response:', participationId); // Debug log
            setParticipationId(participationId);
          } else {
            // If no ID in response, force a refresh of the participation status
            console.log('No participation ID in response, checking status...');
            await checkIfJoined();
          }
          
          // Show success alert with participation details
          setTimeout(() => {
            alert(`Successfully joined the activity!\n\n` +
                   `Activity: ${data.data.activity_name || 'N/A'}\n` +
                   `Status: ${data.data.participation_status || 'REGISTERED'}\n` +
                   `Role: ${data.data.participation_role || participationRole}\n` +
                   `Registration Time: ${new Date().toLocaleString()}`);
          }, 100);
        }
        
        // Close the join dialog
        setOpenJoinDialog(false);
        
        // Force refresh all data
        await Promise.all([
          fetchActivityDetail(),
          checkIfJoined()
        ]);
      } else {
        setJoinError(data.message || `Failed to join activity. Status: ${response.status}`);
      }
    } catch (err) {
      setJoinError("Network error while joining activity");
    } finally {
      setJoining(false);
    }
  };
  
  const handleOpenFeedbackDialog = () => {
    setOpenFeedbackDialog(true);
    setFeedbackError('');
    setFeedbackSuccess('');
  };
  
  const handleCloseFeedbackDialog = () => {
    setOpenFeedbackDialog(false);
    setFeedbackError('');
    setFeedbackSuccess('');
    setFeedbackData({
      rating: 0,
      feedback_description: '',
    });
  };
  
  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedbackData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleRatingChange = (event, newValue) => {
    setFeedbackData(prev => ({
      ...prev,
      rating: newValue
    }));
  };
  
  const handleSubmitFeedback = async () => {
    if (typeof feedbackData.rating === 'undefined' || feedbackData.rating === null) {
      setFeedbackError('Please provide a rating');
      return;
    }
    
    // Double check participation status before submitting feedback
    await checkIfJoined();
    
    if (!isParticipating || !participationId) {
      setFeedbackError('You must be a participant to submit feedback');
      return;
    }
    
    setIsSubmittingFeedback(true);
    setFeedbackError('');
    
    try {
      const token = localStorage.getItem("access_token");
      console.log('Submitting feedback with participation ID:', participationId); // Debug log
      
      const response = await fetch('http://localhost:8080/feedbacks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activity_id: parseInt(id),
          participation_id: participationId,
          rating: feedbackData.rating,
          feedback_description: feedbackData.feedback_description || null,
        }),
      });
      
      const data = await response.json();
      console.log('Feedback response:', data); // Debug log
      
      if (response.ok) {
        setFeedbackSuccess('Thank you for your feedback!');
        setTimeout(() => {
          handleCloseFeedbackDialog();
          // Refresh activity data to show the updated feedback status
          fetchActivityDetail();
        }, 1500);
      } else {
        setFeedbackError(data.message || `You already submitted feedback for this activity`);
        
        // If the error is related to invalid participation, refresh the status
        if (response.status === 400 && data.message?.includes('participation')) {
          await checkIfJoined();
        }
      }
    } catch (err) {
      setFeedbackError('Network error while submitting feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (fee) => {
    if (!fee) return "Free";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(fee);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-yellow-100 text-yellow-800";
      case "IN_PROGRESS":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getScheduleStatusColor = (status) => {
    switch (status) {
      case "IN_PROGRESS":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "PUBLISHED":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (error)
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  if (!activity)
    return (
      <div className="text-red-500 text-center mt-4">Activity not found</div>
    );

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <FaArrowLeft /> Back
        </button>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {activity.activity_name}
                </h1>
                <p className="text-gray-600 mt-2">
                  {activity.short_description}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    activity.activity_status
                  )}`}
                >
                  {activity.activity_status.replace(/_/g, " ")}
                </span>
                {activity.is_featured && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    Featured
                  </span>
                )}
              </div>
            </div>

            {/* Organization Info */}
            {activity.organization && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FaBuilding className="text-gray-500" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    {activity.organization.organization_name}
                  </h3>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Type: {activity.organization.organization_category}</p>
                  <p>Contact: {activity.organization.representative_email}</p>
                  <p>Phone: {activity.organization.representative_phone}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Main Description */}
              <p className="text-gray-600 leading-relaxed">
                {activity.description}
              </p>

              {/* Tags */}
              {activity.tags && activity.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {activity.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      <FaTag className="inline mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Activity Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-gray-500" />
                  <div className="text-gray-700">
                    <div>{activity.activity_venue}</div>
                    <div className="text-sm">{activity.address}</div>
                    {activity.latitude && activity.longitude && (
                      <div className="text-xs text-gray-500">
                        ({activity.latitude}, {activity.longitude})
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <FaUsers className="text-gray-500" />
                  <span className="text-gray-700">
                    {activity.current_participants} / {activity.capacity_limit}{" "}
                    participants
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <FaDollarSign className="text-gray-500" />
                  <span className="text-gray-700">
                    {formatCurrency(activity.fee)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <FaClock className="text-gray-500" />
                  <div className="text-gray-700">
                    <div>Start: {formatDate(activity.start_date)}</div>
                    <div>End: {formatDate(activity.end_date)}</div>
                    <div className="text-sm text-red-600">
                      Registration Deadline:{" "}
                      {formatDate(activity.registration_deadline)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Join Activity / Feedback Button */}
              <div className="mt-6">
                {joinError && (
                  <div className="text-red-500 mb-4">{joinError}</div>
                )}
                <div className="flex gap-4">
                  {isParticipating ? (
                    <div className="flex gap-4">
                      <button
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md flex items-center"
                        onClick={handleOpenFeedbackDialog}
                      >
                        <FaStar className="mr-2" />
                        Evaluate Performance and Provide Feedback
                      </button>
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                        ✓ Already Joined
                      </span>
                    </div>
                  ) : (
                    <button
                      className={`px-6 py-2 rounded-md text-white font-medium ${
                        activity.activity_status === "PUBLISHED" &&
                        activity.is_approved &&
                        !isParticipating
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                      onClick={handleOpenJoinDialog}
                      disabled={
                        activity.activity_status !== "PUBLISHED" ||
                        !activity.is_approved ||
                        activity.current_participants >=
                          activity.capacity_limit ||
                        isParticipating
                      }
                    >
                      {activity.current_participants >= activity.capacity_limit
                        ? "Activity Full"
                        : "Join Activity"}
                    </button>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">
                      ❤️ {activity.likes} likes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Schedules Section - Keep existing code */}
          <div className="p-6 bg-gray-50">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Activity Schedules
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activity.activity_schedules?.map((schedule) => (
                <div
                  key={schedule.id}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium text-gray-800">
                      {schedule.activity_description}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getScheduleStatusColor(
                        schedule.status
                      )}`}
                    >
                      {schedule.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="flex items-center gap-2 text-gray-600 mb-2">
                    <FaMapMarkerAlt className="text-gray-500" />
                    {schedule.location}
                  </p>
                  <div className="text-gray-600">
                    <div>Start: {formatDate(schedule.start_time)}</div>
                    <div>End: {formatDate(schedule.end_time)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Dialog open={openJoinDialog} onClose={handleCloseJoinDialog}>
        <DialogTitle>Join Activity</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Role</InputLabel>
            <Select
              value={participationRole}
              label="Select Role"
              onChange={handleRoleChange}
            >
              <MenuItem value="PARTICIPANT">Participant</MenuItem>
              <MenuItem value="CONTRIBUTOR">Contributor</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseJoinDialog}>Cancel</Button>
          <Button
            onClick={handleJoinActivity}
            // disabled={true}
            // variant="contained"
          >
            {joining ? "Joining..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={openFeedbackDialog} onClose={handleCloseFeedbackDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Provide Feedback</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              How would you rate this activity?
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Rating
                  name="rating"
                  value={feedbackData.rating / 2} // Convert to 0-5 scale for display
                  onChange={(event, newValue) => {
                    handleRatingChange(event, newValue * 2); // Convert back to 0-10 scale
                  }}
                  precision={0.5}
                  max={5}
                  size="large"
                  emptyIcon={
                    <FaStar style={{ opacity: 0.3 }} size={32} />
                  }
                  icon={
                    <FaStar style={{ color: '#ffb400' }} size={32} />
                  }
                />
                <Typography variant="h6" sx={{ minWidth: 60 }}>
                  {feedbackData.rating.toFixed(1)}/10
                </Typography>
              </Box>
            </Box>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              margin="normal"
              name="feedback_description"
              label="Your Feedback (Optional)"
              placeholder="Share your experience and any suggestions..."
              value={feedbackData.feedback_description}
              onChange={handleFeedbackChange}
              variant="outlined"
            />
            
            {feedbackError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {feedbackError}
              </Alert>
            )}
            
            {feedbackSuccess && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {feedbackSuccess}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseFeedbackDialog} disabled={isSubmittingFeedback}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitFeedback}
            variant="contained"
            color="primary"
            disabled={isSubmittingFeedback || !feedbackData.rating}
            startIcon={isSubmittingFeedback ? <CircularProgress size={20} /> : null}
          >
            {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ActivityDetail;
