import { useState, useCallback } from 'react';

interface UsePaginationProps {
  initialPage?: number;
  initialPageSize?: number;
  totalPages?: number;
}

interface PaginationState {
  page: number;
  pageSize: number;
  totalPages: number;
}

interface UsePaginationReturn {
  pagination: PaginationState;
  handlePageChange: (event: unknown, newPage: number) => void;
  handlePageSizeChange: (newPageSize: number) => void;
  resetPage: () => void;
  setTotalPages: (total: number) => void;
  getApiPage: () => number; // Returns 0-based page for API calls
}

export const usePagination = ({
  initialPage = 1,
  initialPageSize = 10,
  totalPages = 1,
}: UsePaginationProps = {}): UsePaginationReturn => {
  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    pageSize: initialPageSize,
    totalPages,
  });

  const handlePageChange = useCallback((event: unknown, newPage: number) => {
    setPagination(prev => ({
      ...prev,
      page: newPage,
    }));
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPagination(prev => ({
      ...prev,
      pageSize: newPageSize,
      page: 1, // Reset to first page when changing page size
    }));
  }, []);

  const resetPage = useCallback(() => {
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));
  }, []);

  const setTotalPages = useCallback((total: number) => {
    setPagination(prev => ({
      ...prev,
      totalPages: total,
    }));
  }, []);

  const getApiPage = useCallback(() => {
    return pagination.page - 1; // Convert to 0-based for API
  }, [pagination.page]);

  return {
    pagination,
    handlePageChange,
    handlePageSizeChange,
    resetPage,
    setTotalPages,
    getApiPage,
  };
}; 
