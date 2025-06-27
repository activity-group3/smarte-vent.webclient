import axios, { AxiosResponse } from 'axios';
import { snakeToCamel, camelToSnake } from '../utils/caseConverter';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

interface ApiResponse<T> {
  data: T;
}

// Removed AuthHeaders interface to fix TypeScript compatibility

interface GeneralStatistics {
  totalActivities: number;
  totalParticipants: number;
  totalOrganizations: number;
  completedActivities: number;
  pendingActivities: number;
  [key: string]: any;
}

interface FilterDto {
  timePeriod?: string;
  activityType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// Add helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const statisticsService = {
  /**
   * Get overall statistics without filtering
   * @returns {Promise<GeneralStatistics>} - The statistics
   */
  getStatistics: async (): Promise<GeneralStatistics> => {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await axios.get(
        `${API_URL}/statistics`,
        { headers: getAuthHeader() }
      );
      return snakeToCamel(response.data.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },

  /**
   * Get filtered statistics with custom filters
   * @param {FilterDto} filterDto - The filter options
   * @returns {Promise<GeneralStatistics>} - The filtered statistics
   */
  getFilteredStatistics: async (filterDto: FilterDto): Promise<GeneralStatistics> => {
    try {
      const snakeCaseFilter = camelToSnake(filterDto);
      
      const params = new URLSearchParams();
      if (snakeCaseFilter.time_period) params.append('time_period', snakeCaseFilter.time_period);
      if (snakeCaseFilter.activity_type) params.append('activity_type', snakeCaseFilter.activity_type);
      if (snakeCaseFilter.status) params.append('status', snakeCaseFilter.status);
      if (snakeCaseFilter.start_date) params.append('start_date', snakeCaseFilter.start_date);
      if (snakeCaseFilter.end_date) params.append('end_date', snakeCaseFilter.end_date);

      const response: AxiosResponse<ApiResponse<any>> = await axios.get(
        `${API_URL}/statistics/filter`, 
        { 
          params,
          headers: getAuthHeader()
        }
      );
      
      return snakeToCamel(response.data.data);
    } catch (error) {
      console.error('Error fetching filtered statistics:', error);
      throw error;
    }
  },

  /**
   * Get time-based statistics
   * @param {string} period - The time period (daily, weekly, monthly, quarterly, yearly)
   * @returns {Promise<GeneralStatistics>} - The time-based statistics
   */
  getTimePeriodStatistics: async (period: string): Promise<GeneralStatistics> => {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await axios.get(
        `${API_URL}/statistics/${period}`,
        { headers: getAuthHeader() }
      );
      return snakeToCamel(response.data.data);
    } catch (error) {
      console.error(`Error fetching ${period} statistics:`, error);
      throw error;
    }
  }
}; 
 