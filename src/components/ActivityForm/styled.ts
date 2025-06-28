import { styled, Theme } from '@mui/material/styles';
import { TextField, Button, Select, TextareaAutosize } from '@mui/material';

export const StyledTextField = styled(TextField)(({ theme }: { theme: Theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '0.5rem',
    backgroundColor: theme.palette.background.default,
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

export const StyledSelect = styled(Select)(({ theme }: { theme: Theme }) => ({
  borderRadius: '0.5rem',
  backgroundColor: theme.palette.background.default,
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
}));

export const StyledButton = styled(Button)(({ theme }: { theme: Theme }) => ({
  borderRadius: '0.5rem',
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  fontWeight: 600,
}));

export const StyledTextarea = styled(TextareaAutosize)(({ theme }: { theme: Theme }) => ({
  width: '100%',
  padding: theme.spacing(1.5),
  borderRadius: '0.5rem',
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.default,
  fontFamily: theme.typography.fontFamily,
  fontSize: '1rem',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
  '&:focus': {
    outline: 'none',
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
  },
}));

export const FormSection = styled('div')(({ theme }: { theme: Theme }) => ({
  marginBottom: theme.spacing(4),
  '&:last-child': {
    marginBottom: 0,
  },
}));

export const FormActions = styled('div')(({ theme }: { theme: Theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),
  marginTop: theme.spacing(4),
}));

export const ScheduleItem = styled('div')(({ theme }: { theme: Theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
  '&:last-child': {
    marginBottom: 0,
  },
}));

export const ScheduleHeader = styled('div')(({ theme }: { theme: Theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
})); 
