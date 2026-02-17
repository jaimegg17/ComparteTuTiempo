import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

export default handleAuth({
  login: handleLogin({
    authorizationParams: {
      // Solicitar access token con audience durante el login
      audience: process.env.AUTH0_AUDIENCE,
      scope: 'openid profile email offline_access',
    },
    returnTo: '/',
  }),
});
