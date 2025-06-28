import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  Box,
  Pagination,
  SelectChangeEvent,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Event as EventIcon,
  ErrorOutline as ErrorOutlineIcon,
  EventBusy as EventBusyIcon,
} from "@mui/icons-material";
import { Participant } from "@/types/entities";

const MyParticipant = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    page: 1,
    size: 6,
    participantRole: "PARTICIPANT",
    participantStatus: "",
    registeredBefore: "",
    sort: "registeredAt,desc",
    registeredAfter: "",
  });

  const [totalPages, setTotalPages] = useState<number>(1);
  const pageSizeOptions = [5, 10, 15, 20];
  const navigate = useNavigate();

  useEffect(() => {
    fetchParticipants();
  }, [filters]);

  const fetchParticipants = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      const queryParams = new URLSearchParams({
        ...filters,
        page: (filters.page - 1).toString(),
        size: filters.size.toString(),
        registeredAfter: filters.registeredAfter
          ? new Date(filters.registeredAfter).toISOString()
          : "",
        registeredBefore: filters.registeredBefore
          ? new Date(filters.registeredBefore).toISOString()
          : "",
      }).toString();
      const response = await fetch(
        `http://localhost:8080/participants?${queryParams}`,
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
        setError(data.message || "Failed to fetch participants");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: SelectChangeEvent<string> | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (e: SelectChangeEvent<string>) => {
    const newSize = Number(e.target.value);
    setFilters((prev) => ({ ...prev, size: newSize, page: 1 }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRegistrationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Registered today";
    if (diffDays === 1) return "Registered yesterday";
    if (diffDays < 7) return `Registered ${diffDays} days ago`;
    return `Registered on ${new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WAITING_TO_START":
        return "bg-amber-100 text-amber-800";
      case "IN_PROGRESS":
        return "bg-emerald-100 text-emerald-800";
      case "COMPLETED":
        return "bg-sky-100 text-sky-800";
      case "CANCELLED":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getParticipationStatusColor = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "bg-green-100 text-green-800";
      case "UNVERIFIED":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "PARTICIPANT":
        return "bg-blue-100 text-blue-800";
      case "CONTRIBUTOR":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case "THIRD_PARTY":
        return "bg-purple-100 text-purple-800";
      case "UNIVERSITY":
        return "bg-cyan-100 text-cyan-800";
      case "DEPARTMENT":
        return "bg-emerald-100 text-emerald-800";
      case "STUDENT_ORGANIZATION":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleActivityClick = (activityId: string | undefined) => {
    if (activityId) {
      navigate(`/activities/${activityId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            My Participant
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            View and manage your participation in activities
          </p>
        </header>

        {/* Happening Activities Section */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              My Active Activities
            </h2>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/activities')}
              className="text-primary-600 hover:bg-primary-50"
            >
              View All Activities
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {participants
              .filter(participant => participant.activity_status === 'IN_PROGRESS')
              .slice(0, 3)
              .map((participant) => (
                <div
                  key={participant.id}
                  onClick={() => handleActivityClick(participant.activity_id)}
                  className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">
                        {participant.activity_name}
                      </h3>
                      <div className="mt-2 flex items-center text-sm text-slate-600">
                        <AccessTimeIcon className="h-4 w-4 mr-1" />
                        <span>{formatRegistrationDate(participant.registration_time)}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">
                      In Progress
                    </span>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-slate-600">
                      <LocationOnIcon className="h-4 w-4 mr-1" />
                      <span className="line-clamp-1">{participant.activity_venue}</span>
                    </div>
                    {participant.end_date &&
                      <div className="flex items-center text-sm text-slate-600">
                        <EventIcon className="h-4 w-4 mr-1" />
                        <span>Ends {formatDate(participant.end_date)}</span>
                      </div>
                    }
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getParticipationStatusColor(participant.participation_status)}`}>
                      {participant.participation_status.replace(/_/g, " ")}
                    </span>
                    {participant.activity_category &&
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getCategoryStyle(participant.activity_category)}`}>
                        {participant.activity_category.replace(/_/g, " ")}
                      </span>
                    }
                  </div>
                  {participant.participation_role === "CONTRIBUTOR" && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/activities/${participant.activity_id}/participants`);
                      }}
                      sx={{ mt: 2, width: '100%' }}
                    >
                      Manage Participants
                    </Button>
                  )}
                </div>
              ))}
            {participants.filter(participant => participant.activity_status === 'IN_PROGRESS').length === 0 && (
              <div className="col-span-full text-center py-8">
                <EventBusyIcon className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-medium text-slate-900">No active activities</h3>
                <p className="mt-1 text-sm text-slate-500">
                  You are not currently participating in any active activities.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Existing filter form */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
              >
                <MenuItem value="registeredAt,desc">Latest Registration</MenuItem>
                <MenuItem value="registeredAt,asc">Earliest Registration</MenuItem>
                <MenuItem value="activityName,asc">Activity Name A-Z</MenuItem>
                <MenuItem value="activityName,desc">Activity Name Z-A</MenuItem>
                {/* <MenuItem value="startDate,asc">Start Date (Earliest First)</MenuItem>
                <MenuItem value="startDate,desc">Start Date (Latest First)</MenuItem> */}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Role</InputLabel>
              <Select
                name="participationRole"
                value={filters.participantRole}
                onChange={handleFilterChange}
              >
                <MenuItem value="PARTICIPANT">Participant</MenuItem>
                <MenuItem value="CONTRIBUTOR">Contributor</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                name="participationStatus"
                value={filters.participantStatus}
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="VERIFIED">Verified</MenuItem>
                <MenuItem value="UNVERIFIED">Unverified</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Registered After"
              type="datetime-local"
              name="registeredAfter"
              value={filters.registeredAfter}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Registered Before"
              type="datetime-local"
              name="registeredBefore"
              value={filters.registeredBefore}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
            {/* <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Page Size</InputLabel>
              <Select
                name="size"
                value={filters.size}
                onChange={handlePageSizeChange}
              >
                {pageSizeOptions.map((size) => (
                  <MenuItem key={size} value={size}>
                    {size} per page
                  </MenuItem>
                ))}
              </Select>
            </FormControl> */}
          </div>
        </div>
        {loading ? (
          <div className="p-12 text-center">
            <CircularProgress size={48} />
            <p className="mt-4 text-slate-600 text-lg">Loading participants...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <ErrorOutlineIcon fontSize="large" className="text-rose-600" />
            <p className="text-rose-600 text-lg font-medium">{error}</p>
            <p className="mt-2 text-slate-500">
              Please try again later or contact support.
            </p>
          </div>
        ) : participants.length === 0 ? (
          <div className="p-12 text-center">
            <EventBusyIcon fontSize="large" className="text-slate-400" />
            <p className="text-slate-600 text-lg font-medium">
              No participants found
            </p>
            <p className="mt-2 text-slate-500">
              Try adjusting your filters or check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="group relative bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md hover:border-violet-200 transition-all duration-300 cursor-pointer"
                onClick={() => handleActivityClick(participant.activity_id)}
              >
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-slate-800 group-hover:text-violet-700 transition-colors duration-200 line-clamp-1">
                    {participant.activity_name}
                  </h3>
                  <div className="mt-2 flex items-center text-sm text-slate-600">
                    <AccessTimeIcon className="h-4 w-4 mr-1" />
                    <span>{formatRegistrationDate(participant.registration_time)}</span>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-slate-600">
                      <LocationOnIcon className="h-4 w-4 mr-1" />
                      <span>{participant.activity_venue}</span>
                    </div>
                    {participant.start_date && participant.end_date &&
                    <div className="flex items-center text-sm text-slate-600">
                      <EventIcon className="h-4 w-4 mr-1" />
                      <span>
                        {formatDate(participant.start_date)} - {formatDate(participant.end_date)}
                      </span>
                    </div>
                    }
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {participant.activity_status &&
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(participant.activity_status)}`}>
                      {participant.activity_status.replace(/_/g, " ")}
                    </span>
                    }
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getParticipationStatusColor(participant.participation_status)}`}>
                      {participant.participation_status.replace(/_/g, " ")}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(participant.participation_role)}`}>
                      {participant.participation_role}
                    </span>
                  </div>
                  {participant.participation_role === "CONTRIBUTOR" && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/activities/${participant.activity_id}/participants`);
                      }}
                      sx={{ mt: 2 }}
                    >
                      Manage Participants
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {totalPages > 1 && (
          // @ts-ignore
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalPages}
              page={filters.page} 
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPagination-ul': {
                  flexWrap: 'nowrap',
                },
              }}
            />
          </Box>
        )}
      </main>
    </div>
  );
};

export default MyParticipant;
