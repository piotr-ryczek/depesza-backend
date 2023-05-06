import {
  Injectable,
  CanActivate,
  Inject,
  ExecutionContext,
  Logger,
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

    const { apikey, authorization } = request.headers; // TODO: apiKey => api-key, also change in WordPress Plugin

    if (!authorization || !apikey) {
      Logger.warn('PublisherApi unauthorized: lack of authorization or apiKey');

      return false;
    }

    const [, apiPassword] = authorization.split('Basic ');

    if (!apiPassword) {
      Logger.warn('PublisherApi unauthorized: lack of apiPassword');

      return false;
    }

    try {
      const publisherId = await this.publishersService.authorizeApiQuery(
        apikey,
        apiPassword,
      );

      request.headers['publisher-id'] = publisherId;
    } catch (error) {
      Logger.warn('PublisherApi unauthorized: apiQuery authorization failed');

      return false;
    }

    return true;
  }
}
