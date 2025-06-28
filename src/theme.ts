import { createTheme, ThemeOptions } from '@mui/material/styles';

// Centralized MUI theme configuration
// Adjust the palette, typography, and other options as needed

// Design tokens generator – extend this for future palettes / typography needs
const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: { main: '#047857' }, // emerald-700
          secondary: { main: '#14b8a6' }, // teal-500
          background: { default: '#f0fdf4', paper: '#ffffff' }, // green-50
        }
      : {
          primary: { main: '#14b8a6' }, // teal-500
          secondary: { main: '#047857' }, // emerald-700
          background: { default: '#18181b', paper: '#23272f' }, // zinc-900
        }),
  },
  typography: {
    fontFamily: ['Inter', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
    // Heading defaults – tweak freely for a more "university" feeling
    h1: { fontWeight: 700, fontSize: '2.25rem' },
    h2: { fontWeight: 700, fontSize: '1.875rem' },
    h3: { fontWeight: 600, fontSize: '1.5rem' },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
  },
});

// Public helpers -------------------------------------------------------------
export const getTheme = (mode: 'light' | 'dark') => createTheme(getDesignTokens(mode));

// Ready-made themes (useful for tests or static rendering)
export const lightTheme = getTheme('light');
export const darkTheme = getTheme('dark');