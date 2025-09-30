import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1D2F3D', // Tu color principal
      light: '#0F1A23',
      dark: '#0F1A23',
    },
    secondary: {
      main: '#C7D2D2', // Tu color de fondo del header
      light: '#E8EDED',
      dark: '#A8B8B8',
    },
    text: {
      primary: '#3C4242', // Tu color de texto principal
      secondary: '#6B7280',
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#3C4242',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#3C4242',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#3C4242',
    },
    body1: {
      fontSize: '1rem',
      color: '#3C4242',
    },
    body2: {
      fontSize: '0.875rem',
      color: '#6B7280',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
        },
        contained: {
          backgroundColor: '#1D2F3D',
          '&:hover': {
            backgroundColor: '#0F1A23',
          },
        },
        outlined: {
          borderColor: '#D1D5DB',
          color: '#374151',
          '&:hover': {
            borderColor: '#9CA3AF',
            backgroundColor: '#F9FAFB',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            '& fieldset': {
              borderColor: '#D1D5DB',
            },
            '&:hover fieldset': {
              borderColor: '#9CA3AF',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1D2F3D',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#C7D2D2',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});
