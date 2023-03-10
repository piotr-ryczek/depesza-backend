import {
  Injectable,
  CanActivate,
  Inject,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PublisherJwtToken } from 'src/types';

@Injectable()
export class PublishersGuard implements CanActivate {
  constructor(@Inject(JwtService) private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const { authorization } = request.headers;

    if (!authorization) {
      return false;
    }

    const [, token]: [string, string] = authorization.split('Bearer ');

    if (!token) {
      Logger.warn('Publisher unauthorized: lack of token');

      return false;
    }

    try {
      this.jwtService.verify(token);
    } catch (error) {
      Logger.warn('Publisher unauthorized: token verification failed');
      Logger.warn(error.stack);

      return false;
    }

    const { publisherId, hasPassword } = this.jwtService.decode(
      token,
    ) as PublisherJwtToken;

    if (!publisherId || !hasPassword) {
      Logger.warn(
        'Publisher unauthorized: lack of publisherId or hasPassword is false',
      );

      return false;
    }

    request.headers.publisherId = publisherId;
    request.headers.jwtToken = token;

    return true;
  }
}
