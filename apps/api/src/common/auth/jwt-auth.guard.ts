import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

interface AuthenticatedUser {
  sub?: string;
  id?: string;
}

interface InfoWithMessage {
  message?: string;
}

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

  handleRequest<TUser = AuthenticatedUser>(
    err: unknown,
    user: TUser,
    info: unknown,
    context: ExecutionContext,
    status?: unknown,
  ): TUser {
    const request = context.switchToHttp().getRequest();
    const error = err instanceof Error ? err : null;
    const infoMessage =
      typeof info === 'string'
        ? info
        : (info as InfoWithMessage | undefined)?.message;
    
    if (error || !user) {
      this.logger.error('❌ JWT Auth Guard failed:', {
        hasError: !!error,
        errorMessage: error?.message,
        errorName: error?.name,
        hasUser: !!user,
        info: infoMessage || info,
        status,
        authHeader: request.headers?.authorization ? 'Present' : 'Missing',
      });
      throw error || new UnauthorizedException('Token inválido o expirado');
    }
    const authUser = user as AuthenticatedUser;
    this.logger.debug('✅ JWT Auth Guard passed, user:', authUser.sub || authUser.id || 'unknown');
    return user;
  }
}

// Alias for Auth0
export const Auth0Guard = JwtAuthGuard;
