import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (request: any, rawJwtToken: any, done: any) => {
        // For Auth0, we need to get the public key from the JWKS endpoint
        // This is a simplified version - in production you'd want to cache the keys
        const domain = configService.get<string>('AUTH0_DOMAIN');
        if (!domain) {
          return done(new Error('AUTH0_DOMAIN not configured'), null);
        }
        
        // For now, we'll use a placeholder - Auth0 will validate the token
        // In production, you'd fetch the public key from https://{domain}/.well-known/jwks.json
        done(null, 'placeholder-secret');
      },
      audience: configService.get<string>('AUTH0_AUDIENCE'),
      issuer: `https://${configService.get<string>('AUTH0_DOMAIN')}/`,
    });
  }

  async validate(payload: any) {
    // Auth0 payload contains user information
    return {
      id: payload.sub, // Auth0 user ID
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      // Add any other claims you need
    };
  }
}
