import { describe, expect, it } from 'vitest';
import { getFriendlyErrorMessage } from './error-messages';

describe('getFriendlyErrorMessage', () => {
  it('normaliza errores de archivo demasiado grande', () => {
    const result = getFriendlyErrorMessage(new Error('File too large'));
    expect(result).toMatch(/supera el tamaño máximo/i);
  });

  it('normaliza errores de red', () => {
    const result = getFriendlyErrorMessage(new TypeError('Failed to fetch'));
    expect(result).toMatch(/no se pudo conectar/i);
  });

  it('normaliza errores de autenticación por status', () => {
    const result = getFriendlyErrorMessage({ status: 401, message: 'Unauthorized' });
    expect(result).toMatch(/sesión ha caducado|inicia sesión/i);
  });
});
