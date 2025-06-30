import { useState, useCallback } from 'react';

type ValidationRule<T> = (value: T) => string | null;

type ValidationRules<T extends Record<string, any>> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

interface UseFormValidationProps<T extends Record<string, any>> {
  initialValues: T;
  validationRules?: ValidationRules<T>;
}

interface UseFormValidationReturn<T extends Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  isValid: boolean;
  isDirty: boolean;
  // Form management
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setValues: (newValues: Partial<T>) => void;
  resetForm: () => void;
  setFieldError: <K extends keyof T>(field: K, error: string | null) => void;
  clearErrors: () => void;
  // Event handlers
  handleInputChange: <K extends keyof T>(field: K) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: <K extends keyof T>(field: K) => (event: any) => void;
  handleCheckboxChange: <K extends keyof T>(field: K) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDateChange: <K extends keyof T>(field: K) => (date: Date | null) => void;
  // Validation
  validateField: <K extends keyof T>(field: K) => boolean;
  validateForm: () => boolean;
  // Utilities
  getFieldProps: <K extends keyof T>(field: K) => {
    value: T[K];
    onChange: (event: any) => void;
    error: boolean;
    helperText: string | undefined;
  };
}

// Common validation rules
export const ValidationRules = {
  required: <T,>(message = 'This field is required'): ValidationRule<T> => 
    (value) => {
      if (value === null || value === undefined || value === '') {
        return message;
      }
      return null;
    },

  email: (message = 'Please enter a valid email address'): ValidationRule<string> =>
    (value) => {
      if (value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
        return message;
      }
      return null;
    },

  minLength: (min: number, message?: string): ValidationRule<string> =>
    (value) => {
      if (value && value.length < min) {
        return message || `Must be at least ${min} characters`;
      }
      return null;
    },

  maxLength: (max: number, message?: string): ValidationRule<string> =>
    (value) => {
      if (value && value.length > max) {
        return message || `Must be no more than ${max} characters`;
      }
      return null;
    },

  pattern: (pattern: RegExp, message = 'Invalid format'): ValidationRule<string> =>
    (value) => {
      if (value && !pattern.test(value)) {
        return message;
      }
      return null;
    },

  phone: (message = 'Please enter a valid phone number'): ValidationRule<string> =>
    (value) => {
      if (value && !/^[0-9]{10,15}$/.test(value.replace(/\s/g, ''))) {
        return message;
      }
      return null;
    },

  min: (min: number, message?: string): ValidationRule<number> =>
    (value) => {
      if (value !== null && value !== undefined && value < min) {
        return message || `Must be at least ${min}`;
      }
      return null;
    },

  max: (max: number, message?: string): ValidationRule<number> =>
    (value) => {
      if (value !== null && value !== undefined && value > max) {
        return message || `Must be no more than ${max}`;
      }
      return null;
    },
};

export const useFormValidation = <T extends Record<string, any>>({
  initialValues,
  validationRules = {},
}: UseFormValidationProps<T>): UseFormValidationReturn<T> => {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const validateField = useCallback(<K extends keyof T>(field: K): boolean => {
    const fieldRules = validationRules[field];
    if (!fieldRules) return true;

    const value = values[field];
    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) {
        setErrors(prev => ({ ...prev, [field]: error }));
        return false;
      }
    }

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    return true;
  }, [values, validationRules]);

  const validateForm = useCallback((): boolean => {
    let isFormValid = true;
    const newErrors: Partial<Record<keyof T, string>> = {};

    Object.keys(validationRules).forEach(field => {
      const fieldKey = field as keyof T;
      const fieldRules = validationRules[fieldKey];
      if (!fieldRules) return;

      const value = values[fieldKey];
      for (const rule of fieldRules) {
        const error = rule(value);
        if (error) {
          newErrors[fieldKey] = error;
          isFormValid = false;
          break;
        }
      }
    });

    setErrors(newErrors);
    return isFormValid;
  }, [values, validationRules]);

  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValuesState(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Validate field on change if it has validation rules
    if (validationRules[field]) {
      setTimeout(() => validateField(field), 0);
    }
  }, [validationRules, validateField]);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...newValues }));
    setIsDirty(true);
  }, []);

  const resetForm = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setIsDirty(false);
  }, [initialValues]);

  const setFieldError = useCallback(<K extends keyof T>(field: K, error: string | null) => {
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const handleInputChange = useCallback(<K extends keyof T>(field: K) => 
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(field, event.target.value as T[K]);
    }, [setValue]);

  const handleSelectChange = useCallback(<K extends keyof T>(field: K) => 
    (event: any) => {
      setValue(field, event.target.value as T[K]);
    }, [setValue]);

  const handleCheckboxChange = useCallback(<K extends keyof T>(field: K) => 
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(field, event.target.checked as T[K]);
    }, [setValue]);

  const handleDateChange = useCallback(<K extends keyof T>(field: K) => 
    (date: Date | null) => {
      setValue(field, date as T[K]);
    }, [setValue]);

  const getFieldProps = useCallback(<K extends keyof T>(field: K) => ({
    value: values[field],
    onChange: handleInputChange(field),
    error: !!errors[field],
    helperText: errors[field],
  }), [values, errors, handleInputChange]);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    isValid,
    isDirty,
    setValue,
    setValues,
    resetForm,
    setFieldError,
    clearErrors,
    handleInputChange,
    handleSelectChange,
    handleCheckboxChange,
    handleDateChange,
    validateField,
    validateForm,
    getFieldProps,
  };
}; 
