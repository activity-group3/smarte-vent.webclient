export enum OrganizationType {
  CLUB = 'CLUB',
  COMPANY = 'COMPANY',
  GOVERNMENT = 'GOVERNMENT',
  EDUCATIONAL = 'EDUCATIONAL',
}

export interface Organization {
  id: number;
  organization_name: string;
  organization_type: OrganizationType | string;
  representative_phone: string;
  representative_email: string;
}

export interface SearchParams {
  name: string;
  organizationType: string;
  size: number;
} 
