import React from 'react';
import {
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import { StyledTextField, StyledSelect } from '../styled';

const FormField = ({
  name,
  label,
  value,
  onChange,
  required = false,
  type = 'text',
  disabled = false,
  multiline = false,
  rows = 1,
  fullWidth = true,
  select = false,
  children,
  error,
  helperText,
  ...props
}) => {
  const commonProps = {
    fullWidth,
    name,
    label,
    value: value || '',
    onChange,
    required,
    disabled,
    error: !!error,
    helperText: error || helperText,
    variant: 'outlined',
    ...props,
  };

  return (
    <FormControl fullWidth={fullWidth} error={!!error}>
      {!select && (
        <StyledTextField
          type={type}
          multiline={multiline}
          rows={rows}
          {...commonProps}
        />
      )}
      {select && (
        <>
          <InputLabel id={`${name}-label`}>{label}</InputLabel>
          <StyledSelect
            labelId={`${name}-label`}
            label={label}
            {...commonProps}
          >
            {children}
          </StyledSelect>
        </>
      )}
    </FormControl>
  );
};

export default FormField;
