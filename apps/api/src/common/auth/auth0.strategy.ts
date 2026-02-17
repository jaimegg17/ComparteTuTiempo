import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const domain = configService.get<string>('AUTH0_DOMAIN');
    const audience = configService.get<string>('AUTH0_AUDIENCE');
    
    console.log('🔧 Auth0Strategy configuration:', {
      domain,
      audience,
      issuer: `https://${domain}/`,
    });
    
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

  async validate(payload: any) {
    // Log payload for debugging
    const expectedAudience = this.configService.get<string>('AUTH0_AUDIENCE');
    const tokenAudience = payload.aud;
    const isAudienceValid = Array.isArray(tokenAudience) 
      ? tokenAudience.includes(expectedAudience)
      : tokenAudience === expectedAudience;

    console.log('🔍 JWT Payload validated:', {
      sub: payload.sub,
      email: payload.email,
      aud: tokenAudience,
      expectedAud: expectedAudience,
      isAudienceValid,
      iss: payload.iss,
      exp: payload.exp,
      iat: payload.iat,
      isExpired: Date.now() > payload.exp * 1000,
    });

    // Verify audience - Auth0 can return audience as array or string
    if (!isAudienceValid) {
      console.error('❌ Audience validation failed:', {
        tokenAudience,
        expectedAudience,
      });
      throw new Error('Invalid audience');
    }

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
