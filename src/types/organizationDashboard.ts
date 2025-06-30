export interface OrganizationStats {
  organizationName: string;
  organizationType: string;
  totalActivities: number;
  totalParticipants: number;
  participationRate: number;
  averageFeedbackRating: number;
  upcomingActivities: number;
  inProgressActivities: number;
  completedActivities: number;
  canceledActivities: number;
  activitiesByCategory: Record<string, number>;
  activitiesByMonth: Record<string, number>;
  participantsByMonth: Record<string, number>;
  topActivities: TopActivity[];
  bestRatedActivities?: BestRatedActivity[];
}

export interface TopActivity {
  activityId: number;
  activityName: string;
  currentParticipants: number;
  category: string;
  status: string;
}

export interface BestRatedActivity {
  activityId: number;
  activityName: string;
  averageRating: number;
  feedbackCount: number;
  category: string;
}

export interface ChartDataItem {
  name: string;
  value: number;
}

export interface MonthlyDataItem {
  name: string;
  activities: number;
  participants: number;
}

export interface TopActivityTableItem {
  id: number;
  name: string;
  participants: number;
  category: string;
  status: string;
}

export interface BestRatedTableItem {
  id: number;
  name: string;
  rating: number;
  feedbacks: number;
  category: string;
}

export interface TableColumn {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
}

export type TimePeriod = 'all' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface LineChartLine {
  dataKey: string;
  name: string;
  color: string;
} 
