const IMAGE_SIZE_LIMIT_MB = 10;

function includesAny(text: string, patterns: string[]) {
  const normalized = text.toLowerCase();
  return patterns.some((pattern) => normalized.includes(pattern.toLowerCase()));
}

export function getFriendlyErrorMessage(
  error: unknown,
  fallback = 'Ha ocurrido un error inesperado. Inténtalo de nuevo.',
) {
  const status =
    typeof error === 'object' && error !== null && 'status' in error && typeof error.status === 'number'
      ? error.status
      : undefined;

  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
          ? error.message
          : fallback;

  if (
    status === 413 ||
    includesAny(rawMessage, [
      'too large',
      'demasiado grande',
      'too big',
      'payload too large',
      'file too large',
      'exceeds the maximum',
    ])
  ) {
    return `La imagen supera el tamaño máximo permitido (${IMAGE_SIZE_LIMIT_MB} MB). Elige otra o comprímela.`;
  }

  if (status === 400) {
    return rawMessage || 'Revisa los datos introducidos y vuelve a intentarlo.';
  }

  if (status === 401 || includesAny(rawMessage, ['token', 'sesión', 'session', 'unauthorized', 'authentication'])) {
    return 'Tu sesión ha caducado o no es válida. Inicia sesión de nuevo y vuelve a intentarlo.';
  }

  if (status === 403) {
    return 'No tienes permisos para realizar esta acción.';
  }

  if (status === 404) {
    return 'No se ha encontrado el recurso solicitado.';
  }

  if (status !== undefined && status >= 500) {
    return 'El servidor ha tenido un problema temporal. Inténtalo de nuevo en unos segundos.';
  }

  if (includesAny(rawMessage, ['failed to fetch', 'networkerror', 'network error', 'load failed'])) {
    return 'No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.';
  }

  return rawMessage || fallback;
}
