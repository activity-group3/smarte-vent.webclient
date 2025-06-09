import React, { lazy, Suspense, useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { format } from 'date-fns';

// Material-UI Components
import {
  Box,
  Typography,
  CircularProgress,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

// Icons
import { 
  FaArrowLeft, 
  FaClock, 
  FaMapMarkerAlt, 
  FaUsers, 
  FaUserTie, 
  FaCalendarAlt,  
  FaRegClock, 
  FaMoneyBillWave, 
  FaRegCalendarAlt, 
  FaRegUser, 
  FaBuilding, 
  FaRegBuilding, 
  FaClipboardList, 
  FaChevronLeft, 
  FaChevronRight, 
  FaQuoteLeft, 
  FaQuoteRight, 
  FaTag, 
  FaDollarSign, 
  FaMapMarkedAlt,
  FaStar,
  FaUserCog
} from "react-icons/fa";

// Lazy load the LocationMap component
const LocationMap = lazy(() => import('@/components/LocationMap'));

const OrganizationActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    fetchActivityDetail();
  }, [id]);

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
      } else {
        setError("Failed to fetch activity details");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString, options = {}) => {
    try {
      if (options.dateOnly) {
        return format(new Date(dateString), 'MMM d, yyyy');
      }
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
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

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating / 2);
    const hasHalfStar = rating % 2 >= 1;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-500" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStar key={i} className="text-yellow-500 opacity-50" />);
      } else {
        stars.push(<FaStar key={i} className="text-gray-300" />);
      }
    }
    return <div className="flex">{stars}</div>;
  };

  const handleManageParticipant = () => {
    navigate(`/organization/activities/${id}/participants`);
  };

  const handleReplyClick = (feedback) => {
    setSelectedFeedback(feedback);
    setReplyText(feedback.organization_response || '');
    setReplyDialogOpen(true);
  };

  const handleReplySubmit = async () => {
    if (!selectedFeedback || !replyText.trim()) return;

    setReplyLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://localhost:8080/feedbacks/update`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedFeedback.id,
          organization_response: replyText.trim()
        }),
      });

      const data = await response.json();
      if (data.status_code === 200) {
        // Update the feedback in the local state
        setActivity(prevActivity => ({
          ...prevActivity,
          feedbacks: prevActivity.feedbacks.map(feedback =>
            feedback.id === selectedFeedback.id
              ? { ...feedback, organization_response: replyText.trim(), responded_at: new Date().toISOString() }
              : feedback
          )
        }));
        setReplyDialogOpen(false);
      } else {
        setError("Failed to submit reply");
      }
    } catch (err) {
      setError("Network error while submitting reply");
    } finally {
      setReplyLoading(false);
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

              {/* Location Section - Full Width */}
              <div className="w-full mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <FaMapMarkedAlt className="text-gray-500" />
                  <span className="font-medium">Location</span>
                </div>
                <div className="location-details">
                  <div className="font-medium">{activity.activity_venue}</div>
                  <div className="text-sm location-address">{activity.address}</div>
                  {activity.latitude && activity.longitude && (
                    <div className="location-map-container">
                      <Suspense fallback={
                        <div className="h-64 w-full bg-gray-100 rounded-lg flex items-center justify-center">
                          <CircularProgress size={24} />
                          <span className="ml-2">Loading map...</span>
                        </div>
                      }>
                        <LocationMap 
                          latitude={activity.latitude} 
                          longitude={activity.longitude} 
                          address={activity.address}
                        />
                      </Suspense>
                    </div>
                  )}
                </div>
              </div>

              {/* Other Details in 3-column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
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
            </div>
          </div>

          {/* Activity Schedules Section */}
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
          
          {/* Manage Participant Section */}
          <div className="manage-participant-section flex items-center justify-center">
            <button
              onClick={handleManageParticipant}
              className="manage-participant-button bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-2 rounded-md shadow-md transition duration-300 ease-in-out"
              disabled={activity.activity_status === "CANCELLED"}
              aria-label="Manage participants"
              title={activity.activity_status === "CANCELLED" ? "Cannot manage participants of a cancelled activity" : "Manage participants"}
            >
              <FaUserCog className="button-icon" />
              <span>Manage Participants</span>
            </button>
            <div className="participant-count ml-4" aria-label="Participant count">
              <span className="participant-numbers">
                {activity.current_participants} <span className="divider">/</span> {activity.capacity_limit}
              </span>
              <span className="participant-label">Current Participants</span>
            </div>
          </div>

          {/* Feedbacks Section */}
          {activity.feedbacks && activity.feedbacks.length > 0 && (
            <div className="bg-white">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="feedbacks-section">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">What Participants Say</h2>
                    <div className="flex items-center justify-center text-gray-600">
                      <div className="flex items-center">
                        <FaStar className="text-yellow-400 mr-1 text-xl" />
                        <span className="font-medium text-lg">
                          {(activity.feedbacks.reduce((acc, curr) => acc + (curr.rating / 2), 0) / activity.feedbacks.length).toFixed(1)}
                          <span className="mx-2 text-gray-400">•</span>
                          {activity.feedbacks.length} {activity.feedbacks.length === 1 ? 'Review' : 'Reviews'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="feedbacks-container">
                    {activity.feedbacks.map((feedback) => (
                      <div key={feedback.id} className="feedback-card hover:shadow-md transition-shadow duration-200">
                        <div className="feedback-header flex justify-between items-start mb-4">
                          <div>
                            <div className="text-sm text-gray-500 mb-1">
                              {formatDate(feedback.created_date, { dateOnly: true })}
                            </div>
                            <h3 className="font-medium text-lg text-gray-800">
                              {feedback.student_name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                            <span className="text-yellow-500 font-bold">
                              {(feedback.rating / 2).toFixed(1)}
                            </span>
                            {renderStars(feedback.rating)}
                          </div>
                        </div>
                        
                        <div className="text-gray-700 relative pl-6 mb-4">
                          <FaQuoteLeft className="text-gray-200 text-3xl absolute -top-2 left-0" />
                          <p className="text-gray-700 leading-relaxed">"{feedback.feedback_description}"</p>
                        </div>
                        
                        {feedback.organization_response ? (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                            <div className="flex items-center justify-between text-sm font-medium text-blue-800 mb-2">
                              <div className="flex items-center">
                                <FaBuilding className="mr-2" />
                                <span>Response from {activity.organization.organization_name}</span>
                              </div>
                              <Button
                                size="small"
                                onClick={() => handleReplyClick(feedback)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Edit Response
                              </Button>
                            </div>
                            <div className="text-gray-700 pl-6 border-l-2 border-blue-200 ml-1">
                              <p className="text-gray-700">{feedback.organization_response}</p>
                              {feedback.responded_at && (
                                <div className="mt-2 text-xs text-blue-600">
                                  {formatDate(feedback.responded_at, { dateOnly: true })}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 flex justify-end">
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleReplyClick(feedback)}
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            >
                              Reply to Feedback
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onClose={() => setReplyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reply to Feedback</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your response here..."
            variant="outlined"
            className="mt-4"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleReplySubmit}
            variant="contained"
            color="primary"
            disabled={replyLoading || !replyText.trim()}
          >
            {replyLoading ? <CircularProgress size={24} /> : 'Submit Reply'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrganizationActivityDetail;
