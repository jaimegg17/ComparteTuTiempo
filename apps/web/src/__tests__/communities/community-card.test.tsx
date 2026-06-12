import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommunityCard } from '@/components/CommunityCard';

const mockPush = vi.fn();
const mockJoin = vi.fn();

vi.mock('next/router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    currentLanguage: 'es',
    t: (key: string) => ({
      'communities.private': 'Privada',
      'communities.public': 'Pública',
      'communities.view_details': 'Ver detalles',
      'communities.join': 'Unirme',
      'communities.requestJoin': 'Solicitar unirme',
      'communities.detail.requestJoin': 'Solicitar unirme',
      'communities.no_description': 'Sin descripción',
      'communities.rulesCount': '0 reglas',
      'communities.resourcesCount': '0 recursos',
      'communities.verified': 'Verificada',
      'communities.pending': 'Pendiente',
    }[key] ?? key),
  }),
}));

const community = {
  id: 123,
  name: 'Asociación demo',
  description: 'Descripción demo',
  topics: ['arte'],
  rules: [],
  resources: [],
  isPrivate: true,
  kind: 'ORGANIZATION',
  verificationStatus: 'APPROVED',
  imageUrl: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('CommunityCard routing and private UX', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('navega a /organizations/:id cuando se usa detailBasePath de organizaciones', () => {
    render(<CommunityCard community={community as never} detailBasePath="/organizations" />);

    fireEvent.click(screen.getByText('Asociación demo'));

    expect(mockPush).toHaveBeenCalledWith('/organizations/123');
  });

  it('muestra “Solicitar unirme” para comunidades privadas con acción de unirse', () => {
    render(<CommunityCard community={community as never} showJoinAction onJoin={mockJoin} />);

    expect(screen.getByRole('button', { name: 'Solicitar unirme' })).toBeInTheDocument();
  });
});
