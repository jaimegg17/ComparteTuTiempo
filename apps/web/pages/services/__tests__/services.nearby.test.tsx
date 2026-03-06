import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import ServicesPage from '../index';

const mockPush = vi.fn();

vi.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('@auth0/nextjs-auth0/client', () => ({
  useUser: () => ({
    user: { sub: 'auth0|u1' },
  }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    accessToken: null,
  }),
}));

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/hooks/useErrorHandling', () => ({
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'network-error',
  },
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

vi.mock('@/components/ServiceCard', () => ({
  ServiceCard: ({ service }: { service: { id: number; title: string } }) => (
    <div data-testid="service-card">{service.title}</div>
  ),
}));

vi.mock('@/components/filters/FilterSidebar', () => ({
  FilterSidebar: () => <div data-testid="filter-sidebar" />,
}));

describe('ServicesPage nearby flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ services: [] }),
    } as Response);

    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: vi.fn((success: PositionCallback) =>
          success({
            coords: {
              latitude: 40.4168,
              longitude: -3.7038,
            },
          } as GeolocationPosition),
        ),
      },
      configurable: true,
    });
  });

  it('activa búsqueda nearby usando geolocalización y permite cambiar radio', async () => {
    render(<ServicesPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole('button', { name: /Usar mi ubicación/i }));

    await waitFor(() => {
      const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls;
      expect(calls.some(([url]) =>
        String(url).includes('/api/services/nearby/search') &&
        String(url).includes('nearLat=40.4168') &&
        String(url).includes('nearLng=-3.7038') &&
        String(url).includes('radiusKm=10'),
      )).toBe(true);
    });

    fireEvent.click(screen.getByRole('button', { name: /25 km/i }));

    await waitFor(() => {
      const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls;
      expect(calls.some(([url]) =>
        String(url).includes('/api/services/nearby/search') &&
        String(url).includes('radiusKm=25'),
      )).toBe(true);
    });
  });

  it('permite quitar cercanía y volver al endpoint general de servicios', async () => {
    render(<ServicesPage />);

    fireEvent.click(screen.getByRole('button', { name: /Usar mi ubicación/i }));

    await waitFor(() => {
      const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls;
      expect(calls.some(([url]) => String(url).includes('/api/services/nearby/search'))).toBe(true);
    });

    fireEvent.click(screen.getByRole('button', { name: /Quitar cercanía/i }));

    await waitFor(() => {
      const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls;
      expect(calls.some(([url]) =>
        String(url).includes('/api/services?') && !String(url).includes('/nearby/search'),
      )).toBe(true);
    });
  });
});
