export enum ActivityStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  PUBLISHED = "PUBLISHED",
  CANCELLED = "CANCELLED",
  PENDING = "PENDING",
}

export enum ActivityCategory {
  THIRD_PARTY = "THIRD_PARTY",
  UNIVERSITY = "UNIVERSITY",
  STUDENT_ORGANIZATION = "STUDENT_ORGANIZATION",
}

export interface Activity {
  id: number;
  activity_name: string;
  activity_category: string;
  activity_venue: string;
  start_date: string;
  end_date: string;
  activity_status: string;
  capacity_limit: number;
  current_participants: number;
  is_approved: boolean;
}

export interface ActivityFilters {
  activity_name: string;
  status: string | null;
  activity_category: string | null;
  startDateFrom: Date | null;
  startDateTo: Date | null;
  endDateFrom: Date | null;
  endDateTo: Date | null;
  min_attendance_score_unit: string;
  max_attendance_score_unit: string;
  min_capacity_limit: string;
  max_capacity_limit: string;
  activity_venue: string;
  fee: string;
  registration_deadline: Date | null;
}

export type SortField =
  | "startDate"
  | "endDate"
  | "activityName"
  | "activityStatus"
  | "activityCategory"; 
