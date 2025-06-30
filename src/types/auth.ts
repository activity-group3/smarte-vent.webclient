export interface LoginForm {
  identify_code: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginResponse {
  status_code: number;
  message?: string;
  data?: {
    access_token: string;
    account: {
      role: string;
      [key: string]: any;
    };
  };
}

export interface User {
  id?: string;
  username?: string;
  name?: string;
  email?: string;
  role?: "ADMIN" | "ORGANIZATION" | "STUDENT" | string;
  full_name?: string;
  identify_code?: string;
  organization_name?: string;
  [key: string]: any;
}

export interface SidebarProps {
  Uprising?: any; // You might want to define this type based on what Uprising is
  onLogout: () => void;
} 
