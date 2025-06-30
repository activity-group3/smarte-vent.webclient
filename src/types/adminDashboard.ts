export interface EnhancedGeneralStatistics {
  totalActivities: number;
  totalParticipants: number;
  totalOrganizations: number;
  completedActivities: number;
  pendingActivities: number;
  activitiesLastWeek?: number;
  activitiesLastMonth?: number;
  averageRating?: number;
  totalReviews?: number;
  activitiesByCategory?: Record<string, number>;
  averageRatingsByActivity?: Array<{
    activityId: string;
    score: number;
  }>;
  topKeywords?: Array<{
    keyword: string;
    count: number;
  }>;
  [key: string]: any;
}

export interface FilterState {
  timePeriod: string;
  activityType: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
}

export interface TimePeriod {
  label: string;
  value: string;
}

export interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

export interface RatingDataItem {
  activityId: string;
  score: number;
  fill: string;
}

export interface KeywordDataItem {
  keyword: string;
  count: number;
  fill: string;
} 
