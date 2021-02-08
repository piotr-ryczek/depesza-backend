import {
  Injectable,
  CanActivate,
  Inject,
  ExecutionContext,
} from '@nestjs/common';
import { PublishersService } from 'src/modules/publishers/publishers.service';

@Injectable()
export class PublishersApiGuard implements CanActivate {
  constructor(
    @Inject(PublishersService)
    private readonly publishersService: PublishersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const { apikey, authorization } = request.headers;

    if (!authorization || !apikey) {
      return false;
    }

    const [, apiPassword] = authorization.split('Basic ');

    if (!apiPassword) {
      return false;
    }

    try {
      const publisherId = await this.publishersService.authorizeApiQuery(
        apikey,
        apiPassword,
      );

      request.headers.publisherId = publisherId;
    } catch (error) {
      return false;
    }

    return true;
  }
}
