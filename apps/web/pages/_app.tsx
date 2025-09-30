import { UserProvider } from '@auth0/nextjs-auth0/client';
import { MuiThemeProvider } from '@/lib/theme-provider';
import { I18nProvider } from '@/components/I18nProvider';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MuiThemeProvider>
      <UserProvider>
        <I18nProvider>
          <Component {...pageProps} />
        </I18nProvider>
      </UserProvider>
    </MuiThemeProvider>
  );
}
