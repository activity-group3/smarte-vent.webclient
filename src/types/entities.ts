export interface Organization {
  organization_name: string;
  organization_category: string;
  representative_email: string;
  representative_phone: string;
}

export interface ActivitySchedule {
  id: string;
  activity_description: string;
  status: string;
  location: string;
  start_time: string;
  end_time: string;
}

export interface Feedback {
  id: string;
  created_date: string;
  student_name: string;
  rating: number;
  feedback_description: string;
  organization_response?: string;
  responded_at?: string;
}

export interface Activity {
  id: string;
  activity_name: string;
  short_description?: string;
  description: string;
  start_date: string;
  end_date: string;
  activity_venue: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  activity_status: string;
  activity_category: string;
  current_participants: number;
  capacity_limit: number;
  is_participating?: boolean;
  is_featured?: boolean;
  is_approved?: boolean;
  organization?: Organization;
  tags?: string[];
  fee?: number;
  registration_deadline?: string;
  likes?: number;
  activity_schedules?: ActivitySchedule[];
  feedbacks?: Feedback[];
}

export interface Participant {
  id: string;
  activity_id?: string;
  activity_name: string;
  student_name?: string;
  participant_name?: string; 
  identify_code?: string;
  registration_time: string;
  participation_status: 'VERIFIED' | 'UNVERIFIED' | 'REJECTED';
  participation_role: 'PARTICIPANT' | 'CONTRIBUTOR';
  activity_category?: string;
  activity_venue?: string;
  start_date?: string;
  end_date?: string;
  activity_status?: string;
}

export enum ParticipationStatus {
  UNVERIFIED = 'UNVERIFIED',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum ActivityStatus {
  PUBLISHED = "PUBLISHED",
  WAITING_TO_START = "WAITING_TO_START",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  PENDING = "PENDING",
};

export enum ActivityCategory {
  THIRD_PARTY = "THIRD_PARTY",
  UNIVERSITY = "UNIVERSITY",
  DEPARTMENT = "DEPARTMENT",
  STUDENT_ORGANIZATION = "STUDENT_ORGANIZATION",
};

export interface RecentActivity {
  activityId: string;
  activityName: string;
  activityCategory: string;
  participationRole: string;
  participationStatus: string;
  participationDate: string;
  hoursSpent: number;
  assessmentScore?: number;
  participationId: string;
}

export interface StudentStats {
  studentId: string;
  studentName: string;
  totalTrainingScore: number;
  totalParticipationHours: number;
  totalActivitiesParticipated: number;
  activitiesAsParticipant: number;
  activitiesAsVolunteer: number;
  activitiesByCategory: Record<string, number>;
  monthlyParticipationTrend: Record<string, number>;
  recentActivities: RecentActivity[];
} 
