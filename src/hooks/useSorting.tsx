import { useState, useCallback } from 'react';

type SortDirection = 'asc' | 'desc';

interface UseSortingProps<T extends string> {
  initialField?: T;
  initialDirection?: SortDirection;
}

interface SortingState<T extends string> {
  field: T;
  direction: SortDirection;
}

interface UseSortingReturn<T extends string> {
  sorting: SortingState<T>;
  handleSortChange: (field: T) => void;
  toggleDirection: () => void;
  setSorting: (field: T, direction: SortDirection) => void;
  getSortString: () => string; // Returns "field,direction" format for API
}

export const useSorting = <T extends string>({
  initialField,
  initialDirection = 'desc',
}: UseSortingProps<T> = {}): UseSortingReturn<T> => {
  const [sorting, setSortingState] = useState<SortingState<T>>({
    field: initialField as T,
    direction: initialDirection,
  });

  const handleSortChange = useCallback((field: T) => {
    setSortingState(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const toggleDirection = useCallback(() => {
    setSortingState(prev => ({
      ...prev,
      direction: prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const setSorting = useCallback((field: T, direction: SortDirection) => {
    setSortingState({ field, direction });
  }, []);

  const getSortString = useCallback(() => {
    return `${sorting.field},${sorting.direction}`;
  }, [sorting]);

  return {
    sorting,
    handleSortChange,
    toggleDirection,
    setSorting,
    getSortString,
  };
}; 
