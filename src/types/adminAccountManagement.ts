export enum AccountRole {
  ADMIN = "ADMIN",
  STUDENT = "STUDENT",
  ORGANIZATION = "ORGANIZATION",
}

export enum MajorType {
  NONE = "",
  IT = "IT",
  EE = "EE",
  IS = "IS",
  AE = "AE",
  AI = "AI",
}

export interface Account {
  id: number;
  username: string;
  name: string;
  email: string;
  phone?: string;
  identify_code?: string;
  major?: string;
  role: keyof typeof AccountRole | string;
  is_active: boolean;
}

export interface Filters {
  fullName: string;
  email: string;
  phone: string;
  identifyCode: string;
  role: string;
  major: string;
  isActive: string;
}

export interface NewAccount {
  username: string;
  password: string;
  identifyCode: string;
  fullName: string;
  email: string;
  phone: string;
  major: string;
  role: string;
} 
