import axios from 'axios';
import { camelizeKeys, decamelizeKeys } from 'humps';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

/**
 * Get the current user's account information
 * @returns {Promise<Object>} The user account data
 */
export const getMyAccount = async () => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.get(
      `${API_URL}/accounts/my-account`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return camelizeKeys(response.data.data);
  } catch (error) {
    console.error('Error fetching account info:', error);
    throw error;
  }
};

/**
 * Update user account information
 * @param {Object} accountData - The account data to update
 * @param {number} accountData.id - Account ID
 * @param {string} accountData.phone - Phone number
 * @param {string} accountData.email - Email address
 * @returns {Promise<Object>} The updated account data
 */
export const updateAccount = async (accountData) => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.post(
      `${API_URL}/accounts/update`,
      decamelizeKeys(accountData),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return camelizeKeys(response.data);
  } catch (error) {
    console.error('Error updating account:', error);
    throw error;
  }
};

/**
 * Change user password
 * @param {Object} passwordData - The password data
 * @param {string} passwordData.oldPassword - Current password
 * @param {string} passwordData.newPassword - New password
 * @param {string} passwordData.confirmPassword - Confirm new password
 * @returns {Promise<Object>} The response data
 */
export const changePassword = async (passwordData) => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.post(
      `${API_URL}/auth/change-password`,
      {
        old_password: passwordData.oldPassword,
        new_password: passwordData.newPassword,
        confirm_password: passwordData.confirmPassword
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

export default {
  getMyAccount,
  updateAccount,
  changePassword,
};
