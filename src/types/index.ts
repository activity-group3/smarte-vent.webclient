// Authentication types
export type { LoginForm, RegisterForm, LoginResponse, User } from './auth';
export type { SidebarProps } from './auth';

// Activity detail types
export * from './activityDetail';

// Component props types
export * from './componentProps';

// UI types
export type { NavItem, Feature, Step, Testimonial, RouteError } from './ui';
export type { ApiResponse } from './ui';

// Main entity types (preferred versions)
export * from './entities';

// Activity management (excluding duplicates)
export type { Activity as ActivityManagement, ActivityFilters, SortField } from './activityManagement';

// Other types (commented out to avoid conflicts - import directly from specific files)
// export * from './adminAccountManagement';
// export * from './adminDashboard';
// export * from './organizationAnalysis';
// export * from './organizationDashboard';
// export * from './organizationInformation';
// export * from './organizationList';
// export * from './participantManagement'; 
