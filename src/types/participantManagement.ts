export enum ParticipationStatus {
  UNVERIFIED = "UNVERIFIED",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

export enum ParticipationRole {
  PARTICIPANT = "PARTICIPANT",
  CONTRIBUTOR = "CONTRIBUTOR",
}

export enum SortFields {
  REGISTRATION_TIME = "registeredAt",
  IDENTIFY_CODE = "identifyCode",
  PARTICIPANT_NAME = "participantName",
  START_DATE = "startDate",
  END_DATE = "endDate",
}

export type SortDirection = "asc" | "desc";

export interface Participant {
  id: number;
  identify_code: string;
  participant_name: string;
  start_date: string;
  end_date: string;
  registration_time: string;
  participation_status: ParticipationStatus;
  participation_role: ParticipationRole;
  processed_at?: string;
  processed_by?: string;
  rejection_reason?: string;
  verified_note?: string;
}

export interface Filters {
  participationStatus: string;
  participationRole: string;
  registeredAfter: string;
  registeredBefore: string;
  identifyCode: string;
  participantName: string;
}

export interface Sorting {
  field: SortFields;
  direction: SortDirection;
}

export interface VerificationModal {
  open: boolean;
  participantId: number | null;
  status: ParticipationStatus | null;
  rejection_reason: string;
  verified_note: string;
}

export interface DetailLogModal {
  open: boolean;
  participant: Participant | null;
  loading: boolean;
  error: string | null;
}

export interface ActivityDetails {
  id: number;
  name: string;
  category: string;
  venue: string;
  status: string;
  start_date: string;
  end_date: string;
}

export interface Feedback {
  id: number;
  rating: number;
  comment: string;
  participant_name: string;
  created_at: string;
}

export interface ApiResponse<T> {
  status_code: number;
  data: T;
}

export interface ParticipantsResponse {
  results: Participant[];
  total_pages: number;
}

export interface ActionButtonsProps {
  participant: Participant;
  onVerify: (participantId: number, status: ParticipationStatus) => void;
  onRemove: (participantId: number) => void;
} 
