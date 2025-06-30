import { useState, useCallback } from 'react';

interface UseModalProps<T = any> {
  initialOpen?: boolean;
  initialData?: T | null;
}

interface UseModalReturn<T = any> {
  isOpen: boolean;
  data: T | null;
  open: (data?: T) => void;
  close: () => void;
  toggle: () => void;
  setData: (data: T | null) => void;
  updateData: (updates: Partial<T>) => void;
  clearData: () => void;
}

export const useModal = <T = any>({
  initialOpen = false,
  initialData = null,
}: UseModalProps<T> = {}): UseModalReturn<T> => {
  const [isOpen, setIsOpen] = useState<boolean>(initialOpen);
  const [data, setData] = useState<T | null>(initialData);

  const open = useCallback((newData?: T) => {
    setIsOpen(true);
    if (newData !== undefined) {
      setData(newData);
    }
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const updateData = useCallback((updates: Partial<T>) => {
    setData(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const clearData = useCallback(() => {
    setData(null);
  }, []);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
    setData,
    updateData,
    clearData,
  };
}; 
