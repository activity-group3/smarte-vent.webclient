export const ActivityStatus = {
  WAITING_TO_START: "WAITING_TO_START",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export const ActivityCategory = {
  STUDENT_ORGANIZATION: "STUDENT_ORGANIZATION",
  UNIVERSITY: "UNIVERSITY",
  THIRD_PARTY: "THIRD_PARTY"
};

export const SortFields = {
  START_DATE: "startDate",
  END_DATE: "endDate",
  ACTIVITY_NAME: "activityName",
  ACTIVITY_STATUS: "activityStatus",
  ACTIVITY_CATEGORY: "activityCategory",
};

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
