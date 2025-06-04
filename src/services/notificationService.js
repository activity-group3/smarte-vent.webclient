import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

/**
 * Service for handling notification-related API calls
 */
const notificationService = {
  /**
   * Get recent notifications with pagination
   * @param {number} page - Page number (0-based according to API response)
   * @param {number} size - Number of notifications per page
   * @returns {Promise} - Promise resolving to notifications data
   */
  getNotifications: async (page, size) => {
    try {
      const response = await axios.get(`${API_URL}/notifications`, {
        params: { page, size },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      
      // API response is wrapped in a data object
      const { data } = response.data;
      
      // Map the API response to our expected format
      return {
        items: data.results.map(item => ({
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
   * @returns {Promise} - Promise resolving to success status
   */
  markAsRead: async (id) => {
    try {
      const response = await axios.post(
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
   * @returns {Promise} - Promise resolving to success status
   */
  deleteNotification: async (id) => {
    try {
      const response = await axios.post(
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
   * @returns {Promise} - Promise resolving to count data
   */
  getUnreadCount: async () => {
    try {
      // In a real implementation, we would use a dedicated endpoint
      // For now, we'll calculate it from the notifications list
      const response = await notificationService.getNotifications(1, 100);
      return response.items.filter(item => !item.isRead).length;
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      return 0;
    }
  },
};

export default notificationService;
