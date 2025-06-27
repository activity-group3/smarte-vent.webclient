import axios, { AxiosResponse } from 'axios';
import { snakeToCamel, camelToSnake } from '../utils/caseConverter';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

interface ApiResponse<T> {
  data: T;
}

interface StudentStatistics {
  totalActivities: number;
  completedActivities: number;
  pendingActivities: number;
  totalParticipations: number;
  averageRating?: number;
  hoursContributed?: number;
  [key: string]: any;
}

interface StudentFilter {
  timePeriod?: string;
  activityCategory?: string;
  participationRole?: string;
  participationStatus?: string;
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

export const studentStatisticsService = {
  /**
   * Get current student's statistics
   * @returns {Promise<StudentStatistics>} - The student statistics
   */
  getMyStatistics: async (): Promise<StudentStatistics> => {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await axios.get(
        `${API_URL}/api/student-statistics/my-statistics`,
        { headers: getAuthHeader() }
      );
      return snakeToCamel(response.data.data);
    } catch (error) {
      console.error('Error fetching student statistics:', error);
      throw error;
    }
  },

  /**
   * Get statistics for a specific student by ID
   * @param {number} studentId - The student ID
   * @returns {Promise<StudentStatistics>} - The student statistics
   */
  getStudentStatistics: async (studentId: number): Promise<StudentStatistics> => {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await axios.get(
        `${API_URL}/api/student-statistics/student/${studentId}`,
        { headers: getAuthHeader() }
      );
      return snakeToCamel(response.data.data);
    } catch (error) {
      console.error('Error fetching student statistics:', error);
      throw error;
    }
  },

  /**
   * Get filtered statistics for a student
   * @param {number | null} studentId - The student ID (optional, if not provided will use current student)
   * @param {StudentFilter} filter - The filter options
   * @returns {Promise<StudentStatistics>} - The filtered student statistics
   */
  getFilteredStudentStatistics: async (
    studentId: number | null, 
    filter: StudentFilter
  ): Promise<StudentStatistics> => {
    try {
      const snakeCaseFilter = camelToSnake(filter);
      
      const params = new URLSearchParams();
      if (snakeCaseFilter.time_period) params.append('time_period', snakeCaseFilter.time_period);
      if (snakeCaseFilter.activity_category) params.append('activity_category', snakeCaseFilter.activity_category);
      if (snakeCaseFilter.participation_role) params.append('participation_role', snakeCaseFilter.participation_role);
      if (snakeCaseFilter.participation_status) params.append('participation_status', snakeCaseFilter.participation_status);
      if (snakeCaseFilter.start_date) params.append('start_date', snakeCaseFilter.start_date);
      if (snakeCaseFilter.end_date) params.append('end_date', snakeCaseFilter.end_date);

      const endpoint = studentId 
        ? `${API_URL}/api/student-statistics/student/${studentId}/filter`
        : `${API_URL}/api/student-statistics/my-statistics/filter`;

      const response: AxiosResponse<ApiResponse<any>> = await axios.get(
        endpoint, 
        { 
          params,
          headers: getAuthHeader()
        }
      );
      return snakeToCamel(response.data.data);
    } catch (error) {
      console.error('Error fetching filtered student statistics:', error);
      throw error;
    }
  },

  /**
   * Get statistics for a student within a date range
   * @param {number | null} studentId - The student ID (optional, if not provided will use current student)
   * @param {string} startDate - The start date (ISO format)
   * @param {string} endDate - The end date (ISO format)
   * @returns {Promise<StudentStatistics>} - The date range student statistics
   */
  getDateRangeStatistics: async (
    studentId: number | null, 
    startDate: string, 
    endDate: string
  ): Promise<StudentStatistics> => {
    try {
      const params = new URLSearchParams();
      params.append('start_date', startDate);
      params.append('end_date', endDate);

      const endpoint = studentId 
        ? `${API_URL}/api/student-statistics/student/${studentId}/date-range`
        : `${API_URL}/api/student-statistics/my-statistics/date-range`;

      const response: AxiosResponse<ApiResponse<any>> = await axios.get(
        endpoint,
        { 
          params,
          headers: getAuthHeader()
        }
      );
      return snakeToCamel(response.data.data);
    } catch (error) {
      console.error('Error fetching date range student statistics:', error);
      throw error;
    }
  }
}; 
