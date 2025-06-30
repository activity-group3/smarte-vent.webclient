export interface ParticipationDetails {
  status: string | null;
  role: string | null;
  registered_at: number | null;
  processed_at: number | null;
  processed_by: string | null;
  rejection_reason: string | null;
  verified_note: string | null;
}

export interface FeedbackData {
  rating: number; // 0-10 scale
  feedback_description: string;
}

export interface ActivityParticipantManagementProps {
  activityId: string;
  open?: boolean;
  onClose: () => void;
}

export interface FormatDateOptions {
  dateOnly?: boolean;
} 
