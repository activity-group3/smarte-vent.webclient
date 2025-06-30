import { useState, useEffect, useCallback } from "react";
import { usePagination } from "./usePagination";
import { useSorting } from "./useSorting";
import { useFilters } from "./useFilters";

interface ApiResponse<T> {
  status_code: number;
  message?: string;
  data: {
    results: T[];
    total_pages: number;
    total_elements?: number;
  };
}

interface UseApiDataProps<T, F extends Record<string, any>, S extends string> {
  endpoint: string;
  initialFilters: F;
  initialSortField: S;
  initialSortDirection?: "asc" | "desc";
  initialPageSize?: number;
  additionalParams?: Record<string, string | number | boolean>;
  enabled?: boolean;
  transformParams?: (params: URLSearchParams) => URLSearchParams;
}

interface UseApiDataReturn<T, F extends Record<string, any>, S extends string> {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination: ReturnType<typeof usePagination>["pagination"];
  sorting: ReturnType<typeof useSorting<S>>["sorting"];
  filters: F;
  refetch: () => Promise<void>;
  // Pagination methods
  handlePageChange: (event: unknown, newPage: number) => void;
  handlePageSizeChange: (newPageSize: number) => void;
  // Sorting methods
  handleSortChange: (field: S) => void;
  toggleSortDirection: () => void;
  // Filter methods
  updateFilter: <K extends keyof F>(field: K, value: F[K]) => void;
  updateFilters: (newFilters: Partial<F>) => void;
  resetFilters: () => void;
  clearFilter: <K extends keyof F>(field: K) => void;
  handleSelectChange: <K extends keyof F>(field: K) => (event: any) => void;
  handleInputChange: <K extends keyof F>(field: K) => (event: any) => void;
  handleDateChange: <K extends keyof F>(
    field: K
  ) => (date: Date | null) => void;
  // Utility methods
  hasActiveFilters: () => boolean;
  totalElements?: number;
}

export const useApiData = <T, F extends Record<string, any>, S extends string>({
  endpoint,
  initialFilters,
  initialSortField,
  initialSortDirection = "desc",
  initialPageSize = 10,
  additionalParams = {},
  enabled = true,
  transformParams,
}: UseApiDataProps<T, F, S>): UseApiDataReturn<T, F, S> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState<number>(0);

  const pagination = usePagination({ initialPageSize });
  const sorting = useSorting<S>({
    initialField: initialSortField,
    initialDirection: initialSortDirection,
  });
  const filtersHook = useFilters<F>({ initialFilters });

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No access token found");
      }

      // Build query parameters
      let queryParams = new URLSearchParams({
        page: pagination.getApiPage().toString(),
        size: pagination.pagination.pageSize.toString(),
        sort: sorting.getSortString(),
      });

      // Add filter parameters
      const filterParams = filtersHook.buildQueryParams();
      filterParams.forEach((value, key) => {
        queryParams.append(key, value);
      });

      // Add additional parameters
      Object.entries(additionalParams).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });

      // Transform parameters if needed
      if (transformParams) {
        queryParams = transformParams(queryParams);
      }

      const response = await fetch(`${endpoint}?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();

      if (result.status_code === 200 && result.data) {
        setData(result.data.results || []);
        pagination.setTotalPages(result.data.total_pages || 1);
        setTotalElements(result.data.total_elements || 0);
      } else {
        throw new Error(result.message || "Failed to fetch data");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Network error occurred";
      setError(errorMessage);
      setData([]);
      pagination.setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [
    enabled,
    endpoint,
    pagination,
    sorting,
    filtersHook,
    additionalParams,
    transformParams,
  ]);

  // Effect to fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset to first page when filters or sorting change
  useEffect(() => {
    pagination.resetPage();
  }, [filtersHook.filters, sorting.sorting.field, sorting.sorting.direction]);

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      pagination.handlePageSizeChange(newPageSize);
    },
    [pagination]
  );

  const handleSortChange = useCallback(
    (field: S) => {
      sorting.handleSortChange(field);
    },
    [sorting]
  );

  const toggleSortDirection = useCallback(() => {
    sorting.toggleDirection();
  }, [sorting]);

  return {
    data,
    loading,
    error,
    pagination: pagination.pagination,
    sorting: sorting.sorting,
    filters: filtersHook.filters,
    refetch: fetchData,
    // Pagination methods
    handlePageChange: pagination.handlePageChange,
    handlePageSizeChange,
    // Sorting methods
    handleSortChange,
    toggleSortDirection,
    // Filter methods
    updateFilter: filtersHook.updateFilter,
    updateFilters: filtersHook.updateFilters,
    resetFilters: filtersHook.resetFilters,
    clearFilter: filtersHook.clearFilter,
    handleSelectChange: filtersHook.handleSelectChange,
    handleInputChange: filtersHook.handleInputChange,
    handleDateChange: filtersHook.handleDateChange,
    // Utility methods
    hasActiveFilters: filtersHook.hasActiveFilters,
    totalElements,
  };
};
