import {
  Injectable,
  CanActivate,
  Inject,
  ExecutionContext,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PublisherJwtToken } from 'src/types';

@Injectable()
export class PublishersInitialGuard implements CanActivate {
  constructor(@Inject(JwtService) private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const { authorization } = request.headers;

    if (!authorization) {
      return false;
    }

    const [, token] = authorization.split('Bearer ');

    if (!token) {
      return false;
    }

    try {
      this.jwtService.verify(token);
    } catch (error) {
      return false;
    }

    const { publisherId, hasPassword } = this.jwtService.decode(
      token,
    ) as PublisherJwtToken;

    // If has password then endpoint shouldn't be accessed
    if (!publisherId || hasPassword) {
      return false;
    }

    request.headers['publisher-id'] = publisherId;

    return true;
  }
}
