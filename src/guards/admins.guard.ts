import {
  Injectable,
  CanActivate,
  Inject,
  ExecutionContext,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AdminJwtToken } from 'src/types';

@Injectable()
export class AdminsGuard implements CanActivate {
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

    const { adminId } = this.jwtService.decode(token) as AdminJwtToken;

    if (!adminId) {
      return false;
    }

    return true;
  }
}
