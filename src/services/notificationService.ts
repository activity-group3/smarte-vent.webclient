import axios, { AxiosResponse } from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  createdAt: Date;
  receiverId: string;
  createdBy: string;
}

interface NotificationApiItem {
  id: string;
  title: string;
  content: string;
  is_read: boolean;
  notification_type: string;
  created_date: number; // timestamp
  receiver_id: string;
  created_by: string;
}

interface NotificationApiResponse {
  results: NotificationApiItem[];
  total_elements: number;
  page: number;
  total_pages: number;
  size: number;
}

interface ApiResponse<T> {
  data: T;
}

interface NotificationResponse {
  items: Notification[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

/**
 * Service for handling notification-related API calls
 */
const notificationService = {
  /**
   * Get recent notifications with pagination
   * @param {number} page - Page number (0-based according to API response)
   * @param {number} size - Number of notifications per page
   * @returns {Promise<NotificationResponse>} - Promise resolving to notifications data
   */
  getNotifications: async (page: number, size: number): Promise<NotificationResponse> => {
    try {
      const response: AxiosResponse<ApiResponse<NotificationApiResponse>> = await axios.get(
        `${API_URL}/notifications`, 
        {
          params: { page, size },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      
      // API response is wrapped in a data object
      const { data } = response.data;
      
      // Map the API response to our expected format
      return {
        items: data.results.map((item: NotificationApiItem): Notification => ({
          id: item.id,
          title: item.title,
          message: item.content,
          isRead: item.is_read,
          type: item.notification_type,
          createdAt: new Date(item.created_date * 1000), // Convert timestamp to date
          receiverId: item.receiver_id,
          createdBy: item.created_by
        })),
        totalItems: data.total_elements,
        currentPage: data.page,
        totalPages: data.total_pages,
        pageSize: data.size
      };
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  /**
   * Mark a notification as read
   * @param {string} id - Notification ID
   * @returns {Promise<any>} - Promise resolving to success status
   */
  markAsRead: async (id: string): Promise<any> => {
    try {
      const response: AxiosResponse<any> = await axios.post(
        `${API_URL}/notifications/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  /**
   * Delete a notification
   * @param {string} id - Notification ID
   * @returns {Promise<any>} - Promise resolving to success status
   */
  deleteNotification: async (id: string): Promise<any> => {
    try {
      const response: AxiosResponse<any> = await axios.post(
        `${API_URL}/notifications/${id}/delete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  },

  /**
   * Get unread notification count
   * @returns {Promise<number>} - Promise resolving to count data
   */
  getUnreadCount: async (): Promise<number> => {
    try {
      // In a real implementation, we would use a dedicated endpoint
      // For now, we'll calculate it from the notifications list
      const response: NotificationResponse = await notificationService.getNotifications(1, 100);
      return response.items.filter((item: Notification) => !item.isRead).length;
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      return 0;
    }
  },
};

export default notificationService; 
