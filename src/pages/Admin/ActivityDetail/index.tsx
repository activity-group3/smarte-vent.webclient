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

// Type definitions
interface Organization {
  organization_name: string;
  organization_category: string;
  representative_email: string;
  representative_phone: string;
}

interface ActivitySchedule {
  id: number;
  activity_description: string;
  status: "ONGOING" | "COMPLETED" | "CANCELLED" | "PENDING";
  location: string;
  start_time: string;
  end_time: string;
}

interface Activity {
  id: number;
  activity_name: string;
  short_description: string;
  description: string;
  activity_status:
    | "WAITING_TO_START"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";
  is_featured: boolean;
  organization?: Organization;
  tags?: string[];
  activity_venue: string;
  address: string;
  latitude?: number;
  longitude?: number;
  current_participants: number;
  capacity_limit: number;
  fee?: number;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  activity_schedules?: ActivitySchedule[];
}

interface ApiResponse {
  status_code: number;
  data: Activity;
}

type ActivityStatus =
  | "WAITING_TO_START"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";
type ScheduleStatus = "ONGOING" | "COMPLETED" | "CANCELLED" | "PENDING";

const AdminActivityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivityDetail();
  }, [id]);

  const fetchActivityDetail = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://localhost:8080/activities/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data: ApiResponse = await response.json();
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

  const handleManageParticipant = async (): Promise<void> => {
    navigate(`/admin/activities/${id}/participants`);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (fee?: number): string => {
    if (!fee) return "Free";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(fee);
  };

  const getStatusColor = (status: ActivityStatus): string => {
    switch (status) {
      case "WAITING_TO_START":
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

  const getScheduleStatusColor = (status: ScheduleStatus): string => {
    switch (status) {
      case "ONGOING":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "PENDING":
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
              <p className="text-gray-600 mt-2">{activity.short_description}</p>
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
                {activity.tags.map((tag: string, index: number) => (
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

            {/* Keep your existing button section */}
            <div className="mt-6">
              {joinError && (
                <div className="text-red-500 mb-4">{joinError}</div>
              )}
              <button
                className={`px-6 py-2 rounded-md text-white font-medium ${
                  activity.activity_status === "WAITING_TO_START" && !joining
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                onClick={handleManageParticipant}
                disabled={
                  joining || activity.activity_status !== "WAITING_TO_START"
                }
              >
                {joining ? "Waiting..." : "Manage Participant"}
              </button>
            </div>
          </div>
        </div>

        {/* Activity Schedules Section */}
        <div className="p-6 bg-gray-50">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Activity Schedules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activity.activity_schedules?.map((schedule: ActivitySchedule) => (
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
  );
};

export default AdminActivityDetail;
