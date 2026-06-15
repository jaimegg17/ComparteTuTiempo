import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';

interface Auth0JwtPayload {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  aud?: string | string[];
  iss?: string;
  exp?: number;
  iat?: number;
}

@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const domain = configService.get<string>('AUTH0_DOMAIN');
    const audience = configService.get<string>('AUTH0_AUDIENCE');
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${domain}/.well-known/jwks.json`,
      }),
      // Don't validate audience automatically - Auth0 can return it as array or string
      // We'll validate it manually in the validate() method
      audience: false, // Disable automatic audience validation
      issuer: `https://${domain}/`,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: Auth0JwtPayload) {
    const expectedAudience = this.configService.get<string>('AUTH0_AUDIENCE');
    const expectedAudienceValue = expectedAudience ?? '';
    const tokenAudience = payload.aud;
    const isAudienceValid = Array.isArray(tokenAudience) 
      ? tokenAudience.includes(expectedAudienceValue)
      : tokenAudience === expectedAudienceValue;

    // Verify audience. Auth0 can return it as an array or a string.
    if (!isAudienceValid) {
      throw new UnauthorizedException('Invalid audience');
    }

    // Auth0 payload contains user information
    return {
      sub: payload.sub, // Auth0 user ID (standard claim)
      id: payload.sub,  // Alias for compatibility
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  }
}
