import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { ReactNode } from 'react';
import CreateServicePage from '../create';

vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('next/script', () => ({
  default: () => null,
}));

vi.mock('@auth0/nextjs-auth0/client', () => ({
  useUser: () => ({
    user: { sub: 'auth0|u1' },
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/components/Layout', () => ({
  Layout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/ImageUpload', () => ({
  ImageUpload: () => <div data-testid="image-upload" />,
}));

vi.mock('@/shared/hooks/use-upload', () => ({
  useUploadImage: () => ({
    isPending: false,
  }),
}));

describe('CreateServicePage maps warning', () => {
  it('muestra aviso cuando falta NEXT_PUBLIC_GOOGLE_MAPS_API_KEY', async () => {
    const previousValue = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    render(<CreateServicePage />);

    expect(
      await screen.findByText(/Google Places no está configurado en frontend/i),
    ).toBeInTheDocument();

    if (previousValue) {
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = previousValue;
    }
  });
});
