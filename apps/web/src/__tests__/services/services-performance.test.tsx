import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import ServicesPage from '@/../pages/services';

const scriptSrcs: string[] = [];

vi.mock('next/script', () => ({
  default: ({ src }: { src?: string }) => {
    if (src) scriptSrcs.push(src);
    return null;
  },
}));

vi.mock('next/router', () => ({
  useRouter: () => ({ push: vi.fn(), isReady: true, query: {} }),
}));

vi.mock('@auth0/nextjs-auth0/client', () => ({
  useUser: () => ({ user: { sub: 'auth0|u1' } }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ accessToken: null }),
}));

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/hooks/useErrorHandling', () => ({
  ERROR_MESSAGES: { NETWORK_ERROR: 'network-error' },
  useErrorHandling: () => ({
    error: null,
    loading: false,
    clearError: vi.fn(),
    handleAsyncOperation: async <T,>(operation: () => Promise<T>) => operation(),
  }),
}));

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/ToastProvider', () => ({
  useToast: () => ({ showToast: vi.fn(), hideToast: vi.fn() }),
}));

vi.mock('@/components/ServiceCard', () => ({
  ServiceCard: ({ service }: { service: { id: number; title: string } }) => <div>{service.title}</div>,
}));

vi.mock('@/components/filters/FilterSidebar', () => ({
  FilterSidebar: () => <div />,
}));

describe('ServicesPage performance and Maps loading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    scriptSrcs.length = 0;
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-google-key';
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ services: [] }),
    } as Response);
  });

  it('limita la carga inicial a pageSize=12', async () => {
    render(<ServicesPage />);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    const firstUrl = String((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0]);
    expect(firstUrl).toContain('/api/services?');
    expect(firstUrl).toContain('pageSize=12');
  });

  it('carga Google Maps con loading=async para evitar el warning de producción', async () => {
    render(<ServicesPage />);

    await waitFor(() => {
      expect(scriptSrcs.some((src) => src.includes('maps.googleapis.com/maps/api/js') && src.includes('loading=async'))).toBe(true);
    });
  });
});
