import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { ReactNode } from 'react';
import EditServicePage from '../edit/[id]';

const mockRouter = {
  query: { id: '1' },
  push: vi.fn(),
};

vi.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

vi.mock('next/script', () => ({
  default: () => null,
}));

const mockAuthState = {
  user: { sub: 'auth0|u1' },
  isLoading: false,
};

vi.mock('@auth0/nextjs-auth0/client', () => ({
  useUser: () => mockAuthState,
}));

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

describe('EditServicePage maps warning', () => {
  it('muestra aviso cuando falta NEXT_PUBLIC_GOOGLE_MAPS_API_KEY', async () => {
    const previousKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        service: {
          id: 1,
          title: 'Servicio',
          description: 'Descripción suficientemente larga para test',
          duration: 2,
          category: 'EDUCACION',
          type: 'PRESENCIAL',
          location: 'Madrid',
          userId: 'auth0|u1',
        },
      }),
    } as Response);

    render(<EditServicePage />);

    expect(
      await screen.findByText(/Google Places no está configurado en frontend/i),
    ).toBeInTheDocument();

    if (previousKey) {
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = previousKey;
    }
  });
});
