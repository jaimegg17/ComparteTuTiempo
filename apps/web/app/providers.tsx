"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { MuiThemeProvider } from '@/lib/theme-provider';
import { I18nProvider } from '@/components/I18nProvider';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutos
            retry: 1,
          },
        },
      })
  );

  return (
    <I18nProvider>
      <MuiThemeProvider>
        <UserProvider>
          <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </UserProvider>
      </MuiThemeProvider>
    </I18nProvider>
  );
}
