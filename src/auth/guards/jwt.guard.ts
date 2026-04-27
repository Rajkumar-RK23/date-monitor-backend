import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    console.log('[JWT Guard] Checking authorization...');
    console.log('[JWT Guard] Authorization header:', authHeader ? 'Present' : 'Missing');
    console.log('[JWT Guard] Request URL:', request.url);
    console.log('[JWT Guard] Request method:', request.method);

    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err) {
      console.error('[JWT Guard] Error during token validation:', err.message);
      throw err;
    }

    if (!user) {
      console.error('[JWT Guard] User not found after token validation. Info:', info?.message);
      throw new Error('JWT validation failed - User not authenticated');
    }

    console.log('[JWT Guard] User authenticated successfully:', user.email);
    return user;
  }
}

