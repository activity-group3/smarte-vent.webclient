import { useState, useCallback } from 'react';
import { SelectChangeEvent } from '@mui/material/Select';

interface UseFiltersProps<T extends Record<string, any>> {
  initialFilters: T;
}

interface UseFiltersReturn<T extends Record<string, any>> {
  filters: T;
  updateFilter: <K extends keyof T>(field: K, value: T[K]) => void;
  updateFilters: (newFilters: Partial<T>) => void;
  resetFilters: () => void;
  clearFilter: <K extends keyof T>(field: K) => void;
  handleSelectChange: <K extends keyof T>(field: K) => (event: SelectChangeEvent<any>) => void;
  handleInputChange: <K extends keyof T>(field: K) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleDateChange: <K extends keyof T>(field: K) => (date: Date | null) => void;
  getActiveFilters: () => Partial<T>;
  hasActiveFilters: () => boolean;
  buildQueryParams: () => URLSearchParams;
}

export const useFilters = <T extends Record<string, any>>({
  initialFilters,
}: UseFiltersProps<T>): UseFiltersReturn<T> => {
  const [filters, setFilters] = useState<T>(initialFilters);

  const updateFilter = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const updateFilters = useCallback((newFilters: Partial<T>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const clearFilter = useCallback(<K extends keyof T>(field: K) => {
    setFilters(prev => ({
      ...prev,
      [field]: typeof initialFilters[field] === 'string' ? '' as T[K] : 
               Array.isArray(initialFilters[field]) ? [] as T[K] :
               null as T[K],
    }));
  }, [initialFilters]);

  const handleSelectChange = useCallback(<K extends keyof T>(field: K) => (event: SelectChangeEvent<any>) => {
    updateFilter(field, event.target.value as T[K]);
  }, [updateFilter]);

  const handleInputChange = useCallback(<K extends keyof T>(field: K) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateFilter(field, event.target.value as T[K]);
  }, [updateFilter]);

  const handleDateChange = useCallback(<K extends keyof T>(field: K) => (date: Date | null) => {
    updateFilter(field, date as T[K]);
  }, [updateFilter]);

  const getActiveFilters = useCallback((): Partial<T> => {
    const activeFilters: Partial<T> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined && 
          !(Array.isArray(value) && value.length === 0)) {
        activeFilters[key as keyof T] = value;
      }
    });
    return activeFilters;
  }, [filters]);

  const hasActiveFilters = useCallback((): boolean => {
    return Object.keys(getActiveFilters()).length > 0;
  }, [getActiveFilters]);

  const buildQueryParams = useCallback((): URLSearchParams => {
    const params = new URLSearchParams();
    const activeFilters = getActiveFilters();
    
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value instanceof Date) {
        params.append(key, value.toISOString());
      } else if (typeof value === 'boolean') {
        params.append(key, String(value));
      } else if (value !== null && value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    
    return params;
  }, [getActiveFilters]);

  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    clearFilter,
    handleSelectChange,
    handleInputChange,
    handleDateChange,
    getActiveFilters,
    hasActiveFilters,
    buildQueryParams,
  };
}; 
