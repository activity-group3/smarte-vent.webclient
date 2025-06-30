import { useState, useCallback } from 'react';

interface UseTableActionsProps {
  onRefresh?: () => void;
  confirmDelete?: boolean;
  deleteMessage?: string;
}

interface UseTableActionsReturn<T> {
  loading: boolean;
  error: string | null;
  // CRUD operations
  handleCreate: (endpoint: string, data: any) => Promise<boolean>;
  handleUpdate: (endpoint: string, data: any) => Promise<boolean>;
  handleDelete: (endpoint: string, itemId: string | number, itemName?: string) => Promise<boolean>;
  handleStatusChange: (endpoint: string, itemId: string | number, newStatus: any) => Promise<boolean>;
  // Generic API call
  handleApiCall: (endpoint: string, method: string, data?: any) => Promise<any>;
  // Utility methods
  clearError: () => void;
  setCustomError: (error: string) => void;
}

export const useTableActions = <T,>({
  onRefresh,
  confirmDelete = true,
  deleteMessage = 'Are you sure you want to delete this item?',
}: UseTableActionsProps = {}): UseTableActionsReturn<T> => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found');
    }
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }, []);

  const handleApiCall = useCallback(async (
    endpoint: string,
    method: string,
    data?: any
  ): Promise<any> => {
    try {
      setLoading(true);
      setError(null);

      const config: RequestInit = {
        method,
        headers: getAuthHeaders(),
      };

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(endpoint, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status_code && result.status_code !== 200 && result.status_code !== 201) {
        throw new Error(result.message || 'Operation failed');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const handleCreate = useCallback(async (
    endpoint: string,
    data: any
  ): Promise<boolean> => {
    try {
      await handleApiCall(endpoint, 'POST', data);
      if (onRefresh) onRefresh();
      return true;
    } catch (err) {
      console.error('Create operation failed:', err);
      return false;
    }
  }, [handleApiCall, onRefresh]);

  const handleUpdate = useCallback(async (
    endpoint: string,
    data: any
  ): Promise<boolean> => {
    try {
      await handleApiCall(endpoint, 'POST', data); // Using POST as per your API pattern
      if (onRefresh) onRefresh();
      return true;
    } catch (err) {
      console.error('Update operation failed:', err);
      return false;
    }
  }, [handleApiCall, onRefresh]);

  const handleDelete = useCallback(async (
    endpoint: string,
    itemId: string | number,
    itemName?: string
  ): Promise<boolean> => {
    try {
      const message = itemName 
        ? `Are you sure you want to delete "${itemName}"?`
        : deleteMessage;
      
      if (confirmDelete && !window.confirm(message)) {
        return false;
      }

      const deleteEndpoint = endpoint.includes('{id}') 
        ? endpoint.replace('{id}', String(itemId))
        : `${endpoint}/${itemId}`;

      await handleApiCall(deleteEndpoint, 'DELETE');
      if (onRefresh) onRefresh();
      return true;
    } catch (err) {
      console.error('Delete operation failed:', err);
      return false;
    }
  }, [handleApiCall, onRefresh, confirmDelete, deleteMessage]);

  const handleStatusChange = useCallback(async (
    endpoint: string,
    itemId: string | number,
    newStatus: any
  ): Promise<boolean> => {
    try {
      const statusEndpoint = endpoint.includes('{id}')
        ? endpoint.replace('{id}', String(itemId))
        : `${endpoint}/${itemId}/change-status`;

      await handleApiCall(statusEndpoint, 'POST', { status: newStatus });
      if (onRefresh) onRefresh();
      return true;
    } catch (err) {
      console.error('Status change failed:', err);
      return false;
    }
  }, [handleApiCall, onRefresh]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setCustomError = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  return {
    loading,
    error,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleStatusChange,
    handleApiCall,
    clearError,
    setCustomError,
  };
}; 
