import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const domain = configService.get<string>('AUTH0_DOMAIN');
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${domain}/.well-known/jwks.json`,
      }),
      audience: configService.get<string>('AUTH0_AUDIENCE'),
      issuer: `https://${domain}/`,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    // Auth0 payload contains user information
    return {
      sub: payload.sub, // Auth0 user ID (standard claim)
      id: payload.sub,  // Alias for compatibility
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      // Add any other claims you need
    };
  }
}
