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
  stack?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // First check if user has a session
    const session = await getSession(req, res);
    
    if (!session || !session.user) {
      console.error('❌ No session found');
      return res.status(401).json({ 
        error: 'No session available',
        message: 'No hay sesión activa. Por favor, inicia sesión primero.'
      });
    }

    console.log('✅ Session found for user:', session.user.sub);
    console.log('🔍 Session keys:', Object.keys(session));
    const sessionAccessToken = (session as SessionWithAccessToken).accessToken;
    console.log('🔍 Session has accessToken?', !!sessionAccessToken);

    // Get AUTH0_AUDIENCE from environment
    const audience = process.env.AUTH0_AUDIENCE;
    console.log('🔍 AUTH0_AUDIENCE:', audience || 'NOT SET');

    let accessToken: string | undefined;
    
    // First, check if access token is already in the session (from login)
    if (sessionAccessToken) {
      accessToken = sessionAccessToken;
      console.log('✅ Access token found in session');
    } else {
      // Try to get access token - if AUTH0_AUDIENCE is not set, this will return null
      // But we need to try anyway
      try {
        const tokenResult = await getAccessToken(req, res, {
          refresh: true,
          // Always pass audience if configured
          ...(audience ? { audience } : {}),
        });
        
        accessToken = tokenResult?.accessToken;
        
        if (accessToken) {
          console.log('✅ Access token obtained via getAccessToken');
        } else {
          console.warn('⚠️ getAccessToken returned null/undefined');
          console.warn('⚠️ This usually means the login did not request an access token with audience');
        }
      } catch (tokenError: unknown) {
        const parsedTokenError = (tokenError ?? {}) as ErrorWithMeta;
        console.error('❌ getAccessToken error:', parsedTokenError.message);
        console.error('Error details:', {
          status: parsedTokenError.status,
          code: parsedTokenError.code,
          error: parsedTokenError.error,
        });
      }
    }
    
    // If no access token and no audience is configured, this is expected
    // Auth0 requires an audience to generate access tokens for APIs
    if (!accessToken) {
      const errorMessage = audience 
        ? 'No se pudo obtener el token de autenticación. El token puede haber expirado.'
        : 'AUTH0_AUDIENCE no está configurado. Necesitas configurar AUTH0_AUDIENCE en las variables de entorno del frontend para obtener access tokens.';
      
      console.error('❌ No access token available');
      console.error('Session keys:', Object.keys(session));
      console.error('AUTH0_AUDIENCE:', audience || 'NOT CONFIGURED');
      
      return res.status(401).json({ 
        error: 'No access token available',
        message: errorMessage,
        hint: audience 
          ? 'Intenta cerrar sesión y volver a iniciar sesión.'
          : 'Agrega AUTH0_AUDIENCE a tu archivo .env.local en apps/web/.env.local con el valor del identifier de tu API en Auth0.'
      });
    }

    console.log('✅ Access token obtained successfully, length:', accessToken.length);
    return res.status(200).json({ accessToken });
  } catch (error: unknown) {
    const parsedError = (error ?? {}) as ErrorWithMeta;
    console.error('❌ Error getting access token:', parsedError);
    console.error('Error details:', {
      message: parsedError.message,
      status: parsedError.status,
      code: parsedError.code,
      stack: parsedError.stack?.substring(0, 500), // Limit stack trace
    });
    return res.status(parsedError.status || 500).json({ 
      error: parsedError.message || 'Failed to get access token',
      message: 'Error al obtener el token de autenticación. Por favor, intenta iniciar sesión nuevamente.'
    });
  }
}
