import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessToken, getSession } from '@auth0/nextjs-auth0';

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
    console.log('🔍 Session has accessToken?', !!(session as any).accessToken);

    // Get AUTH0_AUDIENCE from environment
    const audience = process.env.AUTH0_AUDIENCE;
    console.log('🔍 AUTH0_AUDIENCE:', audience || 'NOT SET');

    let accessToken: string | undefined;
    
    // First, check if access token is already in the session (from login)
    if ((session as any).accessToken) {
      accessToken = (session as any).accessToken;
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
      } catch (tokenError: any) {
        console.error('❌ getAccessToken error:', tokenError.message);
        console.error('Error details:', {
          status: tokenError.status,
          code: tokenError.code,
          error: tokenError.error,
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
  } catch (error: any) {
    console.error('❌ Error getting access token:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      code: error.code,
      stack: error.stack?.substring(0, 500), // Limit stack trace
    });
    return res.status(error.status || 500).json({ 
      error: error.message || 'Failed to get access token',
      message: 'Error al obtener el token de autenticación. Por favor, intenta iniciar sesión nuevamente.'
    });
  }
}

