import React from 'react';

export interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
}

export interface Feature {
  icon: React.ReactNode;
  title: string;
  text: string;
}

export interface Step {
  icon: React.ReactNode;
  title: string;
  text: string;
}

export interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  quote: string;
}

export interface RouteError {
  status?: number;
  statusText?: string;
  message?: string;
}

export interface ApiResponse<T = any> {
  status_code: number;
  message?: string;
  data?: T;
} 
