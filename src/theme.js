import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2c3e50',
    },
    secondary: {
      main: '#34495e',
    },
    background: {
      default: '#f8f9fa',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 6,
        },
      },
    },
    MuiDatePicker: {
      styleOverrides: {
        root: {
          backgroundColor: 'white',
        },
      },
    },
    MuiTimePicker: {
      styleOverrides: {
        root: {
          backgroundColor: 'white',
        },
      },
    },
    MuiDateTimePicker: {
      styleOverrides: {
        root: {
          backgroundColor: 'white',
        },
      },
    },
  },
});

export default theme; 
