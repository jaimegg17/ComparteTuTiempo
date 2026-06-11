import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessToken, getSession } from '@auth0/nextjs-auth0';

type SessionWithAccessToken = {
  accessToken?: string;
};

type ErrorWithMeta = {
  message?: string;
  status?: number;
  code?: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getSession(req, res);

    if (!session?.user) {
      return res.status(401).json({
        error: 'No session available',
        message: 'No hay sesión activa. Por favor, inicia sesión primero.',
      });
    }

    const sessionAccessToken = (session as SessionWithAccessToken).accessToken;
    const audience = process.env.AUTH0_AUDIENCE;
    let accessToken: string | undefined = sessionAccessToken;

    if (!accessToken) {
      try {
        const tokenResult = await getAccessToken(req, res, {
          refresh: true,
          ...(audience ? { audience } : {}),
        });
        accessToken = tokenResult?.accessToken;
      } catch {
        accessToken = undefined;
      }
    }

    if (!accessToken) {
      const errorMessage = audience
        ? 'No se pudo obtener el token de autenticación. El token puede haber expirado.'
        : 'AUTH0_AUDIENCE no está configurado. Necesitas configurar AUTH0_AUDIENCE en las variables de entorno del frontend para obtener access tokens.';

      return res.status(401).json({
        error: 'No access token available',
        message: errorMessage,
        hint: audience
          ? 'Intenta cerrar sesión y volver a iniciar sesión.'
          : 'Agrega AUTH0_AUDIENCE a las variables de entorno del frontend con el identifier de tu API en Auth0.',
      });
    }

    return res.status(200).json({ accessToken });
  } catch (error: unknown) {
    const parsedError = (error ?? {}) as ErrorWithMeta;
    return res.status(parsedError.status || 500).json({
      error: parsedError.message || 'Failed to get access token',
      message: 'Error al obtener el token de autenticación. Por favor, intenta iniciar sesión nuevamente.',
    });
  }
}
