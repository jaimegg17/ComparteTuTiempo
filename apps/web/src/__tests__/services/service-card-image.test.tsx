import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ServiceCard } from '@/components/ServiceCard';

vi.mock('next/router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('ServiceCard image performance', () => {
  it('renderiza las imágenes con lazy loading y decoding async', () => {
    render(
      <ServiceCard
        service={{
          id: 1,
          title: 'Clases de pintura',
          description: 'Aprende pintura',
          price: 0,
          duration: 2,
          location: 'Madrid',
          category: 'ARTE',
          type: 'PRESENCIAL',
          intent: 'OFFER',
          imageUrl: 'https://example.com/image.jpg',
        }}
      />,
    );

    const image = screen.getByRole('img', { name: 'Clases de pintura' });
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('decoding', 'async');
  });
});
