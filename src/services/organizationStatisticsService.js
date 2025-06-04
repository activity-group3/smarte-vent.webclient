import axios from 'axios';
import { snakeToCamel, camelToSnake } from '../utils/caseConverter';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Add helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const organizationStatisticsService = {
  /**
   * Get general statistics for an organization
   * @param {number} organizationId - The organization ID
   * @returns {Promise} - The organization statistics
   */
  getOrganizationStatistics: async (organizationId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/organization-statistics/organization/${organizationId}`,
        { headers: getAuthHeader() }
      );
      return snakeToCamel(response.data.data);
    } catch (error) {
      console.error('Error fetching organization statistics:', error);
      throw error;
    }
  },

  /**
   * Get filtered statistics for an organization
   * @param {number} organizationId - The organization ID
   * @param {Object} filter - The filter options
   * @returns {Promise} - The filtered organization statistics
   */
  getFilteredOrganizationStatistics: async (organizationId, filter) => {
    try {
      const snakeCaseFilter = camelToSnake(filter);
      
      const params = new URLSearchParams();
      if (snakeCaseFilter.time_period) params.append('timePeriod', snakeCaseFilter.time_period);
      if (snakeCaseFilter.activity_type) params.append('activityType', snakeCaseFilter.activity_type);
      if (snakeCaseFilter.status) params.append('status', snakeCaseFilter.status);
      if (snakeCaseFilter.start_date) params.append('startDate', snakeCaseFilter.start_date);
      if (snakeCaseFilter.end_date) params.append('endDate', snakeCaseFilter.end_date);

      const response = await axios.get(
        `${API_URL}/api/organization-statistics/organization/${organizationId}/filter`, 
        { 
          params,
          headers: getAuthHeader()
        }
      );
      
      return snakeToCamel(response.data.data);
    } catch (error) {
      console.error('Error fetching filtered organization statistics:', error);
      throw error;
    }
  },

  /**
   * Get time-based statistics for an organization
   * @param {number} organizationId - The organization ID
   * @param {string} period - The time period (daily, weekly, monthly, quarterly, yearly)
   * @returns {Promise} - The time-based organization statistics
   */
  getTimePeriodStatistics: async (organizationId, period) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/organization-statistics/organization/${organizationId}/${period}`,
        { headers: getAuthHeader() }
      );
      return snakeToCamel(response.data.data);
    } catch (error) {
      console.error(`Error fetching ${period} organization statistics:`, error);
      throw error;
    }
  },

  /**
   * Get statistics for an organization within a date range
   * @param {number} organizationId - The organization ID
   * @param {string} startDate - The start date (ISO format)
   * @param {string} endDate - The end date (ISO format)
   * @returns {Promise} - The date range organization statistics
   */
  getDateRangeStatistics: async (organizationId, startDate, endDate) => {
    try {
      const params = new URLSearchParams();
      params.append('startDate', startDate);
      params.append('endDate', endDate);

      const response = await axios.get(
        `${API_URL}/api/organization-statistics/organization/${organizationId}/date-range`,
        { 
          params,
          headers: getAuthHeader()
        }
      );
      
      return snakeToCamel(response.data.data);
    } catch (error) {
      console.error('Error fetching date range organization statistics:', error);
      throw error;
    }
  }
};
