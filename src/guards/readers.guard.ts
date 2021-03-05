import {
  Injectable,
  CanActivate,
  Inject,
  ExecutionContext,
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

    const { readerId, hasAccess } = this.jwtService.decode(
      token,
    ) as ReaderJwtToken;

    if (!readerId || !hasAccess) {
      return false;
    }

    request.headers.readerId = readerId;
    request.headers.jwtToken = token;

    return true;
  }
}
