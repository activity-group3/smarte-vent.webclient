export const ActivityStatus = {
  WAITING_TO_START: "WAITING_TO_START",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type ActivityStatusKey = keyof typeof ActivityStatus;
export type ActivityStatusValue = (typeof ActivityStatus)[ActivityStatusKey];

export const ActivityCategory = {
  STUDENT_ORGANIZATION: "STUDENT_ORGANIZATION",
  UNIVERSITY: "UNIVERSITY",
  THIRD_PARTY: "THIRD_PARTY",
} as const;

export type ActivityCategoryKey = keyof typeof ActivityCategory;
export type ActivityCategoryValue = (typeof ActivityCategory)[ActivityCategoryKey];

export const SortFields = {
  START_DATE: "startDate",
  END_DATE: "endDate",
  ACTIVITY_NAME: "activityName",
  ACTIVITY_STATUS: "activityStatus",
  ACTIVITY_CATEGORY: "activityCategory",
} as const;

export type SortFieldKey = keyof typeof SortFields;
export type SortFieldValue = (typeof SortFields)[SortFieldKey];

export const API_BASE_URL: string = import.meta.env.VITE_API_URL || "http://localhost:8080"; 
