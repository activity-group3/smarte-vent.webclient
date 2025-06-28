import axios, { AxiosResponse } from "axios";
import { snakeToCamel, camelToSnake } from "../utils/caseConverter";

const API_URL = import.meta.env.VITE_API_URL;

interface OrganizationStatistics {
  organizationName: string;
  organizationType: string;
  totalActivities: number;
  totalParticipants: number;
  upcomingActivities: number;
  inProgressActivities: number;
  completedActivities: number;
  canceledActivities: number;
  participationRate: number;
  averageFeedbackRating: number;
  activitiesByCategory: Record<string, number>;
  participantsByCategory: Record<string, number>;
  activitiesByMonth: Record<string, number>;
  participantsByMonth: Record<string, number>;
  topActivities: Array<{
    activityId: number;
    activityName: string;
    currentParticipants: number;
    category: string;
    status: string;
    participationRate: number;
  }>;
  [key: string]: any;
}

interface FilterOptions {
  timePeriod?: string;
  activityType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

export const organizationStatisticsService = {
  /**
   * Get organization statistics
   * @param {number} organizationId - The organization ID
   * @returns {Promise<OrganizationStatistics>} - Promise resolving to organization statistics
   */
  async getOrganizationStatistics(organizationId: number): Promise<OrganizationStatistics> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await axios.get(
        `${API_URL}/organization-statistics/${organizationId}`,
        { headers: getAuthHeader() }
      );
      return snakeToCamel(response.data.data);
    } catch (error) {
      console.error("Error fetching organization statistics:", error);
      throw error;
    }
  },

  /**
   * Get organization statistics for a specific time period
   * @param {number} organizationId - The organization ID
   * @param {string} timePeriod - The time period (weekly, monthly, yearly)
   * @returns {Promise<OrganizationStatistics>} - Promise resolving to organization statistics
   */
  async getTimePeriodStatistics(organizationId: number, timePeriod: string): Promise<OrganizationStatistics> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await axios.get(
        `${API_URL}/organization-statistics/${organizationId}/${timePeriod}`,
        { headers: getAuthHeader() }
      );
      return snakeToCamel(response.data.data);
    } catch (error) {
      console.error("Error fetching organization time period statistics:", error);
      throw error;
    }
  },

  /**
   * Get organization statistics for a date range
   * @param {number} organizationId - The organization ID
   * @param {string} startDate - The start date
   * @param {string} endDate - The end date
   * @returns {Promise<OrganizationStatistics>} - Promise resolving to organization statistics
   */
  async getDateRangeStatistics(organizationId: number, startDate?: string, endDate?: string): Promise<OrganizationStatistics> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response: AxiosResponse<ApiResponse<any>> = await axios.get(
        `${API_URL}/organization-statistics/${organizationId}/date-range`,
        { 
          params,
          headers: getAuthHeader() 
        }
      );
      return snakeToCamel(response.data.data);
    } catch (error) {
      console.error("Error fetching organization date range statistics:", error);
      throw error;
    }
  },

  /**
   * Get filtered organization statistics
   * @param {number} organizationId - The organization ID
   * @param {FilterOptions} filters - The filter options
   * @returns {Promise<OrganizationStatistics>} - Promise resolving to organization statistics
   */
  async getFilteredOrganizationStatistics(organizationId: number, filters: FilterOptions): Promise<OrganizationStatistics> {
    try {
      const snakeCaseFilter = camelToSnake(filters);
      
      const params = new URLSearchParams();
      if (snakeCaseFilter.time_period) params.append('time_period', snakeCaseFilter.time_period);
      if (snakeCaseFilter.activity_type) params.append('activity_type', snakeCaseFilter.activity_type);
      if (snakeCaseFilter.status) params.append('status', snakeCaseFilter.status);
      if (snakeCaseFilter.start_date) params.append('start_date', snakeCaseFilter.start_date);
      if (snakeCaseFilter.end_date) params.append('end_date', snakeCaseFilter.end_date);

      const response: AxiosResponse<ApiResponse<any>> = await axios.get(
        `${API_URL}/organization-statistics/${organizationId}/filter`,
        { 
          params,
          headers: getAuthHeader() 
        }
      );
      return snakeToCamel(response.data.data);
    } catch (error) {
      console.error("Error fetching filtered organization statistics:", error);
      throw error;
    }
  }
};

export default organizationStatisticsService; 
