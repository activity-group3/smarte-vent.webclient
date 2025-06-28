import axios, { AxiosResponse } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface ApiResponse<T> {
  data: T;
}

interface AccountData {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "ORGANIZATION" | "STUDENT";
  organization_name?: string;
  [key: string]: any;
}
  
interface UpdateAccountRequest {
  name?: string;
  email?: string;
  organization_name?: string;
  [key: string]: any;
}

interface PasswordChangeRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Service for handling account management API calls
 */
const accountService = {
  /**
   * Get account information
   * @returns {Promise<AccountData>} - Promise resolving to account data
   */
  async getAccountInfo(): Promise<AccountData> {
    try {
      const response: AxiosResponse<ApiResponse<AccountData>> = await axios.get(
        `${API_URL}/api/account/info`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error("Error fetching account info:", error);
      throw error;
    }
  },

  /**
   * Update account information
   * @param {UpdateAccountRequest} data - Account update data
   * @returns {Promise<AccountData>} - Promise resolving to updated account data
   */
  async updateAccount(data: UpdateAccountRequest): Promise<AccountData> {
    try {
      const response: AxiosResponse<ApiResponse<AccountData>> = await axios.put(
        `${API_URL}/api/account/update`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error("Error updating account:", error);
      throw error;
    }
  },

  /**
   * Change password
   * @param {PasswordChangeRequest} data - Password change data
   * @returns {Promise<void>} - Promise resolving when password is changed
   */
  async changePassword(data: PasswordChangeRequest): Promise<void> {
    try {
      await axios.put(
        `${API_URL}/api/account/change-password`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  },
};

// Export individual functions for backward compatibility
export const getMyAccount = accountService.getAccountInfo;
export const updateAccount = accountService.updateAccount;
export const changePassword = accountService.changePassword;

export default accountService;
export type { AccountData, UpdateAccountRequest, PasswordChangeRequest }; 
