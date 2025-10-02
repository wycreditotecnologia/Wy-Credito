import { createTheme } from '@mui/material/styles';

// Basado en el Brand Book de Wy Credito
export const theme = createTheme({
  palette: {
    primary: {
      main: '#3097CD', // Strong Blue
    },
    secondary: {
      main: '#31C4E2', // Bright Cyan
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#318590',
    },
  },
  typography: {
    fontFamily: '"Century Gothic Pro", "Segoe UI", sans-serif',
    h1: {
      fontFamily: '"Segoe UI", sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Segoe UI", sans-serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: '"Segoe UI", sans-serif',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          borderRadius: 16,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 25,
          padding: '12px 24px',
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          height: 8,
        },
        thumb: {
          width: 24,
          height: 24,
        },
      },
    },
  },
});