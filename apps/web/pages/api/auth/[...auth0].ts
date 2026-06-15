import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

export default handleAuth({
  login: handleLogin({
    authorizationParams: {
      // Request an access token with audience during login
      audience: process.env.AUTH0_AUDIENCE,
      scope: 'openid profile email offline_access',
    },
    returnTo: '/',
  }),
});
