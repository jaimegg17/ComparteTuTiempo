import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '@/hooks/useAuth';

vi.mock('@auth0/nextjs-auth0/client', () => ({
  useUser: () => ({
    user: { sub: 'auth0|u1' },
    isLoading: false,
    error: undefined,
  }),
}));

const createJwt = (expiresAtSeconds: number) => {
  const payload = btoa(JSON.stringify({ exp: expiresAtSeconds })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `header.${payload}.signature`;
};

describe('useAuth token cache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reutiliza el token en memoria y no llama en bucle a /api/auth/token', async () => {
    const token = createJwt(Math.floor(Date.now() / 1000) + 3600);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ accessToken: token }),
    } as Response);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.accessToken).toBe(token);
    });

    await act(async () => {
      expect(await result.current.getAccessToken()).toBe(token);
      expect(await result.current.getAccessToken()).toBe(token);
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('permite forzar refresco cuando una operación lo necesita', async () => {
    const firstToken = createJwt(Math.floor(Date.now() / 1000) + 3600);
    const freshToken = createJwt(Math.floor(Date.now() / 1000) + 7200);
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ accessToken: firstToken }) } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ accessToken: freshToken }) } as Response);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.accessToken).toBe(firstToken);
    });

    await act(async () => {
      expect(await result.current.getAccessToken(true)).toBe(freshToken);
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
