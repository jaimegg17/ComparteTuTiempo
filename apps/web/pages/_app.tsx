import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { MuiThemeProvider } from '@/lib/theme-provider';
import { I18nProvider } from '@/components/I18nProvider';
import { UserProfileProvider } from '@/contexts/UserProfileContext';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  // Create a QueryClient instance for React Query
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MuiThemeProvider>
        <UserProvider>
          <UserProfileProvider>
            <I18nProvider>
              <Component {...pageProps} />
            </I18nProvider>
          </UserProfileProvider>
        </UserProvider>
      </MuiThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
