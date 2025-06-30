import React, { lazy, Suspense, useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { format } from 'date-fns';
import { useAuth } from "../../../hooks/useAuth";

// Material-UI Components
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  Rating,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  Tooltip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
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
  FaStar
} from "react-icons/fa";
import { Activity } from '@/types/entities';
import { ParticipationDetails, FeedbackData } from '@/types/activityDetail';

// Lazy load the LocationMap component
const LocationMap = lazy(() => import('@/components/LocationMap'));

const ActivityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [participationRole, setParticipationRole] = useState("PARTICIPANT");
  const [openJoinDialog, setOpenJoinDialog] = useState<boolean>(false);
  const [isParticipating, setIsParticipating] = useState<boolean>(false);
  const [participationId, setParticipationId] = useState<number | null>(user?.id || null);
  const [openFeedbackDialog, setOpenFeedbackDialog] = useState<boolean>(false);
  const [participantStatus, setParticipantStatus] = useState<string | null>(null);
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    rating: 0, // 0-10 scale
    feedback_description: ''
  });
  const [feedbackError, setFeedbackError] = useState<string>('');
  const [feedbackSuccess, setFeedbackSuccess] = useState<string>('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);
  
  const renderStars = (rating: number) => {
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

  const [participationDetails, setParticipationDetails] = useState<ParticipationDetails>({
    status: null,
    role: null,
    registered_at: null,
    processed_at: null,
    processed_by: null,
    rejection_reason: null,
    verified_note: null
  });

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
          activity_id: parseInt(id!)
        }),
      });
      
      const data = await response.json();
      console.log('Check joined response:', data); // Debug log
      
      if (response.ok) {
        const isJoined = data.data?.is_joined || false;
        setIsParticipating(isJoined);
        
        // Store all participation details
        if (data.data) {
          setParticipationDetails({
            status: data.data.status,
            role: data.data.role,
            registered_at: data.data.registered_at,
            processed_at: data.data.processed_at,
            processed_by: data.data.processed_by,
            rejection_reason: data.data.rejection_reason,
            verified_note: data.data.verified_note
          });
        }
        
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

  const handleRoleChange = (event: SelectChangeEvent<string>) => {
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
          activity_id: parseInt(id!),
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
    } catch (err: any) {
      setJoinError("Network error while joining activity: " + err.message);
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
  
  const handleFeedbackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFeedbackData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleRatingChange = (event: React.SyntheticEvent, newValue: number | null) => {
    if (newValue !== null) {
      setFeedbackData(prev => ({
        ...prev,
        rating: newValue
      }));
    }
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
          activity_id: parseInt(id!),
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
    } catch (err: any) {
      setFeedbackError('Network error while submitting feedback: ' + err.message);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const formatDate = (dateString: string, options: { dateOnly?: boolean } = {}) => {
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

  const formatCurrency = (fee: number | undefined) => {
    if (!fee) return "Free";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(fee);
  };

  const getStatusColor = (status: string) => {
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

  const getScheduleStatusColor = (status: string) => {
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
                          address={activity.address || ''}
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
                    {activity.registration_deadline &&
                    <div className="text-sm text-red-600">
                      Registration Deadline:{" "}
                      {formatDate(activity.registration_deadline)}
                    </div>
                    }
                  </div>
                </div>
              </div>

              {/* Participation Details Section */}
              {isParticipating && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Participation Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          participationDetails.status === 'UNVERIFIED' ? 'bg-yellow-100 text-yellow-800' :
                          participationDetails.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {participationDetails.status || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Role:</span>
                        <span className="ml-2 text-gray-600">{participationDetails.role || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Registered At:</span>
                        <span className="ml-2 text-gray-600">
                          {participationDetails.registered_at ? 
                            new Date(participationDetails.registered_at * 1000).toLocaleString() : 
                            'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {participationDetails.processed_at && (
                        <div>
                          <span className="font-medium text-gray-700">Processed At:</span>
                          <span className="ml-2 text-gray-600">
                            {new Date(participationDetails.processed_at * 1000).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {participationDetails.processed_by && (
                        <div>
                          <span className="font-medium text-gray-700">Processed By:</span>
                          <span className="ml-2 text-gray-600">{participationDetails.processed_by}</span>
                        </div>
                      )}
                      {participationDetails.rejection_reason && (
                        <div>
                          <span className="font-medium text-gray-700">Rejection Reason:</span>
                          <span className="ml-2 text-red-600">{participationDetails.rejection_reason}</span>
                        </div>
                      )}
                      {participationDetails.verified_note && (
                        <div>
                          <span className="font-medium text-gray-700">Verification Note:</span>
                          <span className="ml-2 text-gray-600">{participationDetails.verified_note}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Join Activity / Feedback Button */}
              <div className="mt-6">
                {joinError && (
                  <div className="text-red-500 mb-4">{joinError}</div>
                )}
                <div className="flex gap-4">
                  {isParticipating ? (
                    <div className="flex gap-4">
                      {participationDetails.status === 'VERIFIED' && (
                        <button
                          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md flex items-center"
                          onClick={handleOpenFeedbackDialog}
                        >
                          <FaStar className="mr-2" />
                          Evaluate Performance and Provide Feedback
                        </button>
                      )}
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-white-800 text-sm font-medium">
                        {participationDetails.status === 'VERIFIED' ? '✓ Already Joined' : '✓ Already Register'}
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
                        
                        {feedback.organization_response && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                            <div className="flex items-center text-sm font-medium text-blue-800 mb-2">
                              <FaBuilding className="mr-2" />
                              <span>Response from {activity.organization!.organization_name}</span>
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
          {/* @ts-ignore */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              How would you rate this activity?
            </Typography>
            {/* @ts-ignore */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Rating
                  name="rating"
                  value={feedbackData.rating / 2} // Convert to 0-5 scale for display
                  onChange={(event, newValue) => {
                    handleRatingChange(event, (newValue || 0) * 2); // Convert back to 0-10 scale
                  }}
                  precision={0.5}
                  max={5}
                  size="large"
                  emptyIcon={
                    <FaStar style={{ opacity: 0.3 }} />
                  }
                  icon={
                    <FaStar style={{ color: '#ffb400' }} />
                  }
                />
                {/* @ts-ignore */}
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
