export interface ActivitySchedule {
  id?: string;
  start_time: Date | string | null;
  end_time: Date | string | null;
  activity_description: string;
  status: 'WAITING_TO_START' | 'IN_PROGRESS' | 'COMPLETED';
  location: string;
}

export interface ActivityFormData {
  id: string;
  activity_name: string;
  description: string;
  start_date: Date | null;
  end_date: Date | null;
  activity_venue: string;
  activity_status: 'WAITING_TO_START' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  capacity_limit: string | number;
  activity_category: 'STUDENT_ORGANIZATION' | 'UNIVERSITY' | 'THIRD_PARTY';
  activity_description: string;
  activity_image: string;
  activity_link: string;
  attendance_score_unit: string;
  activity_schedules: ActivitySchedule[];
  short_description: string;
  tags: string[];
  current_participants: number;
  address: string;
  latitude: string;
  longitude: string;
  fee: string;
  is_featured: boolean;
  is_approved: boolean;
  likes: number;
  registration_deadline: Date | null;
}

export interface ActivityFormProps {
  activity?: Partial<ActivityFormData>;
  onSubmit: (data: ActivityFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export interface FormFieldProps {
  name: string;
  label: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  type?: string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  fullWidth?: boolean;
  select?: boolean;
  children?: React.ReactNode;
  error?: boolean;
  helperText?: React.ReactNode;
  placeholder?: string;
  InputLabelProps?: object;
  inputProps?: object;
} 
