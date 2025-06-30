export interface OrganizationCreateActivityProps {
  onActivityCreated?: () => void;
  initialData?: any;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

export interface PaginatedActivities {
  results: any[];
  total_pages: number;
  current_page: number;
  total_items: number;
}

export interface ActivityStatistics {
  totalActivities: number;
  activeActivities: number;
  completedActivities: number;
  totalParticipants: number;
}

export interface FormattedFormData {
  [key: string]: any;
}

export interface ActivityScheduleFormData {
  activity_description: string;
  location: string;
  start_time: string;
  end_time: string;
  status: string;
} 
