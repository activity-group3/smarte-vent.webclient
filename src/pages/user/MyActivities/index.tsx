import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Button,
  SelectChangeEvent,
} from "@mui/material";
import {
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
  EventBusy as EventBusyIcon,
  ErrorOutline as ErrorOutlineIcon,
} from "@mui/icons-material";
import { Activity } from "@/types/entities";

const MyActivities = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 6,
  });
  const [sort, setSort] = useState({
    field: "startDate",
    direction: "desc",
  });
  const pageSizeOptions = [5, 10, 15, 20];

  useEffect(() => {
    fetchJoinedActivities(pagination.currentPage);
  }, [pagination.currentPage, pagination.pageSize, sort]);

  const toSnakeCase = (str: string) =>
    str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

  const fetchJoinedActivities = async (page: number) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8080/activities/joined?page=${page}&size=${pagination.pageSize}&sort=${sort.field},${sort.direction}`,
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
        setActivities(data.data.results);
        setPagination((prev) => ({
          ...prev,
          totalPages: data.data.total_pages,
        }));
      } else {
        setError("Failed to fetch joined activities");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: newPage,
    }));
  };

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    const [field, direction] = event.target.value.split(",");
    setSort({ field, direction });
  };

  const handlePageSizeChange = (event: SelectChangeEvent<string>) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: Number(event.target.value),
      currentPage: 1, // Reset to page 1 when changing page size
    }));
  };

  const handleActivityClick = (id: string) => {
    navigate(`/activities/${id}`);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WAITING_TO_START":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "IN_PROGRESS":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "COMPLETED":
        return "bg-sky-100 text-sky-800 border border-sky-200";
      case "CANCELLED":
        return "bg-rose-100 text-rose-800 border border-rose-200";
      default:
        return "bg-slate-100 text-slate-800 border border-slate-200";
    }
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case "THIRD_PARTY":
        return "bg-violet-100 text-violet-800 border border-violet-200";
      case "UNIVERSITY":
        return "bg-teal-100 text-teal-800 border border-teal-200";
      case "DEPARTMENT":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "STUDENT_ORGANIZATION":
        return "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200";
      default:
        return "bg-slate-100 text-slate-800 border border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            My Joined Activities
          </h1>
          <p className="mt-2 text-lg text-slate-600">Activities you have joined</p>
        </header>
        <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold text-slate-800">Activities List</h2>
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={`${sort.field},${sort.direction}`}
                  onChange={handleSortChange}
                >
                  <MenuItem value="startDate,desc">Latest First</MenuItem>
                  <MenuItem value="startDate,asc">Earliest First</MenuItem>
                  <MenuItem value="activityName,asc">Name A-Z</MenuItem>
                  <MenuItem value="activityName,desc">Name Z-A</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Page Size</InputLabel>
                <Select value={pagination.pageSize.toString()} onChange={handlePageSizeChange}>
                  {pageSizeOptions.map((size) => (
                    <MenuItem key={size} value={size}>
                      {size} per page
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
          {loading && (
            <div className="p-12 text-center">
              <CircularProgress size={48} />
              <p className="mt-4 text-slate-600 text-lg">Loading activities...</p>
            </div>
          )}
          {error && (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 text-rose-600 mb-4">
                <ErrorOutlineIcon fontSize="large" />
              </div>
              <p className="text-rose-600 text-lg font-medium">{error}</p>
              <p className="mt-2 text-slate-500">
                Please try again later or contact support.
              </p>
            </div>
          )}
          {!loading && !error && activities.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
                <EventBusyIcon fontSize="large" />
              </div>
              <p className="text-slate-600 text-lg font-medium">
                You haven&apos;t joined any activities yet
              </p>
              <p className="mt-2 text-slate-500">
                Join some activities to see them here.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    onClick={() => handleActivityClick(activity.id)}
                    className="group relative bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md hover:border-violet-200 transition-all duration-300 cursor-pointer"
                    role="button"
                    tabIndex={0}
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-slate-800 group-hover:text-violet-700 transition-colors duration-200 line-clamp-1">
                        {activity.activity_name}
                      </h3>
                      <p className="mt-2 text-slate-600 text-sm line-clamp-2">
                        {activity.description}
                      </p>
                      <div className="mt-5 space-y-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            <LocationOnIcon className="h-4 w-4 text-slate-400" />
                          </div>
                          <span className="ml-2 text-sm text-slate-600">
                            {activity.activity_venue}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            <AccessTimeIcon className="h-4 w-4 text-slate-400" />
                          </div>
                          <div className="ml-2 text-sm text-slate-600">
                            <div>
                              <span className="font-medium text-slate-700">Start:</span>{" "}
                              <time>{formatDate(activity.start_date)}</time>
                            </div>
                            <div className="mt-1">
                              <span className="font-medium text-slate-700">End:</span>{" "}
                              <time>{formatDate(activity.end_date)}</time>
                            </div>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between">
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.activity_status)}`}
                            >
                              {activity.activity_status.replace(/_/g, " ")}
                            </span>
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryStyle(activity.activity_category)}`}
                            >
                              {activity.activity_category.replace(/_/g, " ")}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-slate-600 bg-slate-50 px-2 py-1 rounded-md">
                            <PeopleIcon className="mr-1.5 text-slate-400" />
                            <span className="font-medium">{activity.current_participants}</span>
                            <span className="mx-1">/</span>
                            <span>{activity.capacity_limit}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {activities.length > 0 && (
                <div className="flex items-center justify-center p-6 border-t border-slate-100">
                  <Button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    variant="outlined"
                    sx={{ mx: 0.5 }}
                  >
                    Previous
                  </Button>
                  {[...Array(pagination.totalPages)].map((_, index) => (
                    <Button
                      key={index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      variant={
                        pagination.currentPage === index + 1 ? "contained" : "outlined"
                      }
                      sx={{ mx: 0.5 }}
                    >
                      {index + 1}
                    </Button>
                  ))}
                  <Button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    variant="outlined"
                    sx={{ mx: 0.5 }}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyActivities;
