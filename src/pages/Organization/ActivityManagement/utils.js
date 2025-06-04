import { ActivityStatus, ActivityAction, ActivityCategory } from './constants';

export const formatDate = (dateString) => {
  if (!dateString) return "";
  // Consider using a more robust date formatting library if complex formatting is needed
  return new Date(dateString).toLocaleString();
};

export const getStatusColor = (status) => {
  switch (status) {
    case ActivityStatus.PENDING:
      return "warning"; // MUI Chip color prop
    case ActivityStatus.PUBLISHED:
      return "info";
    case ActivityStatus.IN_PROGRESS:
      return "primary";
    case ActivityStatus.COMPLETED:
      return "success";
    case ActivityStatus.CANCELLED:
      return "error";
    default:
      return "default";
  }
};

export const getCategoryColor = (category) => {
  switch (category) {
    case ActivityCategory.THIRD_PARTY:
      return "secondary";
    case ActivityCategory.UNIVERSITY:
      return "primary";
    case ActivityCategory.STUDENT_ORGANIZATION:
      return "success";
    default:
      return "default";
  }
};

export const getAvailableActions = (status) => {
  const actions = [];

  // Common actions
  if (status !== ActivityStatus.PENDING) {
    actions.push(ActivityAction.VIEW_DETAILS);
    actions.push(ActivityAction.VIEW_PARTICIPANTS);
    actions.push(ActivityAction.VIEW_STATISTICS);
  }

  switch (status) {
    case ActivityStatus.PENDING:
      actions.push(ActivityAction.EDIT);
      actions.push(ActivityAction.DELETE);
      actions.push(ActivityAction.PUBLISH);
      break;
    case ActivityStatus.PUBLISHED:
      actions.push(ActivityAction.EDIT); // Or a more limited 'Update Details' action
      actions.push(ActivityAction.CANCEL);
      break;
    case ActivityStatus.IN_PROGRESS:
      // Typically, limited actions once in progress. View actions are already added.
      actions.push(ActivityAction.COMPLETE); 
      // Consider if CANCEL should be available here, might need special handling
      break;
    case ActivityStatus.COMPLETED:
      // View actions already added. Future: REOPEN, CLONE
      break;
    case ActivityStatus.CANCELLED:
      // View actions already added. Future: DELETE (for cleanup), CLONE
      // No specific actions for CANCELLED by default other than viewing.
      break;
    default:
      break;
  }
  return actions;
};

export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    // Attempt to parse error, but provide a fallback if parsing fails or message is not present
    let errorMessage = "Something went wrong";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      // If response is not JSON or error parsing fails
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  
  // Handle cases where response might be empty (e.g., 204 No Content)
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  }
  return response.text(); // Or handle as appropriate for non-JSON responses
};
