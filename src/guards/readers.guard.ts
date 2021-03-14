import {
  Injectable,
  CanActivate,
  Inject,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ReaderJwtToken } from 'src/types';

@Injectable()
export class ReadersGuard implements CanActivate {
  constructor(@Inject(JwtService) private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const { authorization } = request.headers;

    if (!authorization) {
      Logger.warn('Reader unauthorized: lack of authorization');

      return false;
    }

    const [, token] = authorization.split('Bearer ');

    if (!token) {
      Logger.warn('Reader unauthorized: lack of token');

      return false;
    }

    try {
      this.jwtService.verify(token);
    } catch (error) {
      Logger.warn(error.stack);
      Logger.warn('Reader unauthorized: token verification failed');

      return false;
    }

    const { readerId, hasAccess } = this.jwtService.decode(
      token,
    ) as ReaderJwtToken;

    if (!readerId || !hasAccess) {
      Logger.warn('Reader unauthorized: lack of readerId or has not access');

      return false;
    }

    request.headers.readerId = readerId;
    request.headers.jwtToken = token;

    return true;
  }
}
