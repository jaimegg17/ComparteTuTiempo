import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;
    
    this.logger.debug('🔍 JWT Guard - Checking request:', {
      hasAuthHeader: !!authHeader,
      authHeaderPrefix: authHeader?.substring(0, 20) || 'none',
      method: request.method,
      url: request.url,
    });
    
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    
    if (err || !user) {
      this.logger.error('❌ JWT Auth Guard failed:', {
        hasError: !!err,
        errorMessage: err?.message,
        errorName: err?.name,
        hasUser: !!user,
        info: info?.message || info,
        authHeader: request.headers?.authorization ? 'Present' : 'Missing',
      });
      throw err || new UnauthorizedException('Token inválido o expirado');
    }
    this.logger.debug('✅ JWT Auth Guard passed, user:', user.sub);
    return user;
  }
}

// Alias for Auth0
export const Auth0Guard = JwtAuthGuard;
