"use client";

import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme } from './theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function MuiThemeProvider({ children }: ThemeProviderProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
