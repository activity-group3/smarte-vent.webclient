import axios, { AxiosResponse } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface ApiResponse<T> {
  data: T;
}

interface ActivityStatistics {
  totalParticipants: number;
  confirmedParticipants: number;
  pendingParticipants: number;
  completedParticipants: number;
  averageRating?: number;
  feedbackCount?: number;
  [key: string]: any;
}

interface ParticipationTrend {
  date: string;
  count: number;
  [key: string]: any;
}

interface FeedbackAnalysis {
  averageRating: number;
  totalFeedback: number;
  ratingDistribution: Record<number, number>;
  [key: string]: any;
}

interface ComparativeAnalysis {
  currentActivity: ActivityStatistics;
  averageComparison: ActivityStatistics;
  [key: string]: any;
}

interface TimeSeriesData {
  timestamp: string;
  value: number;
  [key: string]: any;
}

interface EffectivenessMetrics {
  roi: number;
  costPerParticipant: number;
  valueGenerated: number;
  [key: string]: any;
}

interface ImprovementRecommendation {
  area: string;
  recommendation: string;
  priority: "high" | "medium" | "low";
  [key: string]: any;
}

/**
 * Service for handling activity statistics API calls
 */
const activityStatisticsService = {
  /**
   * Get statistics for a specific activity
   * @param {number} activityId - The ID of the activity
   * @returns {Promise<ActivityStatistics>} - Promise resolving to activity statistics data
   */
  async getActivityStatistics(activityId: number): Promise<ActivityStatistics> {
    try {
      const response: AxiosResponse<ApiResponse<ActivityStatistics>> = await axios.get(
        `${API_URL}/api/activity-statistics/${activityId}`, 
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error("Error fetching activity statistics:", error);
      throw error;
    }
  },

  /**
   * Get activity statistics for a specific time range
   * @param {number} activityId - The ID of the activity
   * @param {Date} startDate - Start date for the time range
   * @param {Date} endDate - End date for the time range
   * @returns {Promise<ActivityStatistics>} - Promise resolving to time-range specific activity statistics
   */
  getActivityStatisticsByTimeRange: async (
    activityId: number, 
    startDate: Date, 
    endDate: Date
  ): Promise<ActivityStatistics> => {
    try {
      const startDateISO = startDate.toISOString();
      const endDateISO = endDate.toISOString();

      const response: AxiosResponse<ApiResponse<ActivityStatistics>> = await axios.get(
        `${API_URL}/api/activity-statistics/${activityId}/time-range`, 
        {
          params: {
            startDate: startDateISO,
            endDate: endDateISO
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error("Error fetching activity statistics by time range:", error);
      throw error;
    }
  },

  /**
   * Get participation trend data for a specific activity
   * @param {number} activityId - The ID of the activity
   * @returns {Promise<ParticipationTrend[]>} - Promise resolving to participation trend data
   */
  getParticipationTrend: async (activityId: number): Promise<ParticipationTrend[]> => {
    try {
      const response: AxiosResponse<ApiResponse<ParticipationTrend[]>> = await axios.get(
        `${API_URL}/api/activity-statistics/${activityId}/participation-trend`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error("Error fetching participation trend data:", error);
      throw error;
    }
  },
  
  /**
   * Get detailed feedback analysis for a specific activity
   * @param {number} activityId - The ID of the activity
   * @returns {Promise<FeedbackAnalysis>} - Promise resolving to feedback analysis data
   */
  getFeedbackAnalysis: async (activityId: number): Promise<FeedbackAnalysis> => {
    try {
      const response: AxiosResponse<ApiResponse<FeedbackAnalysis>> = await axios.get(
        `${API_URL}/api/activity-statistics/${activityId}/feedback-analysis`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error("Error fetching feedback analysis data:", error);
      throw error;
    }
  },
  
  /**
   * Get comparative analysis for a specific activity
   * @param {number} activityId - The ID of the activity
   * @returns {Promise<ComparativeAnalysis>} - Promise resolving to comparative analysis data
   */
  getComparativeAnalysis: async (activityId: number): Promise<ComparativeAnalysis> => {
    try {
      const response: AxiosResponse<ApiResponse<ComparativeAnalysis>> = await axios.get(
        `${API_URL}/api/activity-statistics/${activityId}/comparative-analysis`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error("Error fetching comparative analysis data:", error);
      throw error;
    }
  },
  
  /**
   * Get time series data for a specific activity
   * @param {number} activityId - The ID of the activity
   * @returns {Promise<TimeSeriesData[]>} - Promise resolving to time series data
   */
  getTimeSeriesData: async (activityId: number): Promise<TimeSeriesData[]> => {
    try {
      const response: AxiosResponse<ApiResponse<TimeSeriesData[]>> = await axios.get(
        `${API_URL}/api/activity-statistics/${activityId}/time-series`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error("Error fetching time series data:", error);
      throw error;
    }
  },
  
  /**
   * Get effectiveness metrics for a specific activity
   * @param {number} activityId - The ID of the activity
   * @param {number} estimatedCost - Estimated cost of the activity
   * @param {number} estimatedValue - Estimated value generated by the activity
   * @returns {Promise<EffectivenessMetrics>} - Promise resolving to effectiveness metrics data
   */
  getEffectivenessMetrics: async (
    activityId: number, 
    estimatedCost = 1000, 
    estimatedValue = 2000
  ): Promise<EffectivenessMetrics> => {
    try {
      const response: AxiosResponse<ApiResponse<EffectivenessMetrics>> = await axios.get(
        `${API_URL}/api/activity-statistics/${activityId}/effectiveness-metrics`,
        {
          params: {
            estimatedCost,
            estimatedValue
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error("Error fetching effectiveness metrics data:", error);
      throw error;
    }
  },
  
  /**
   * Get improvement recommendations for a specific activity
   * @param {number} activityId - The ID of the activity
   * @returns {Promise<ImprovementRecommendation[]>} - Promise resolving to improvement recommendations data
   */
  getImprovementRecommendations: async (activityId: number): Promise<ImprovementRecommendation[]> => {
    try {
      const response: AxiosResponse<ApiResponse<ImprovementRecommendation[]>> = await axios.get(
        `${API_URL}/api/activity-statistics/${activityId}/improvement-recommendations`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error("Error fetching improvement recommendations data:", error);
      throw error;
    }
  },
};

export default activityStatisticsService; 
