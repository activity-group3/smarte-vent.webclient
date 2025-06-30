import { Dayjs } from 'dayjs';

export interface OrganizationStatistics {
  organizationName?: string;
  organizationType?: string;
  totalActivities?: number;
  totalParticipants?: number;
  averageParticipantsPerActivity?: number;
  participationRate?: number;
  averageFeedbackRating?: number;
  totalFeedbacks?: number;
  upcomingActivities?: number;
  inProgressActivities?: number;
  completedActivities?: number;
  canceledActivities?: number;
  activitiesByCategory?: Record<string, number>;
  participantsByCategory?: Record<string, number>;
  activitiesByMonth?: Record<string, number>;
  participantsByMonth?: Record<string, number>;
  topActivities?: TopActivity[];
  bestRatedActivities?: BestRatedActivity[];
  [key: string]: any;
}

export interface TopActivity {
  activityId: number;
  activityName: string;
  currentParticipants: number;
  category: string;
  status: string;
  participationRate: number;
}

export interface BestRatedActivity {
  activityId: number;
  activityName: string;
  averageRating: number;
  feedbackCount: number;
  category: string;
}

export interface Filters {
  timePeriod: string;
  activityType: string;
  status: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface MonthlyData {
  name: string;
  activities: number;
  participants: number;
}

export interface TopActivityTableData {
  id: number;
  name: string;
  participants: number;
  category: string;
  status: string;
  participationRate: string;
}

export interface BestRatedTableData {
  id: number;
  name: string;
  rating: number;
  feedbacks: number;
  category: string;
}

export interface Column {
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right';
} 
