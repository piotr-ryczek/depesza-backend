import {
  Controller,
  Get,
  UseFilters,
  Inject,
  forwardRef,
  Param,
  Query,
  Body,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ApiExceptionFilter } from 'src/lib/exceptions/api-exception.filter';
import { PublishersService } from 'src/modules/publishers/publishers.service';
import { AdminsService } from 'src/modules/admins/admins.service';
import { FilesService } from 'src/modules/files/files.service';
import { AdminsGuard } from 'src/guards';

@Controller('/admin')
@UseFilters(new ApiExceptionFilter())
export class AdminController {
  constructor(
    @Inject(forwardRef(() => AdminsService))
    private readonly adminsService: AdminsService,
    @Inject(forwardRef(() => PublishersService))
    private readonly publishersService: PublishersService,
    @Inject(forwardRef(() => FilesService))
    private readonly filesService: FilesService,
  ) {}

  @Post('/login')
  async login(@Body() payload: { email: string; password: string }) {
    const { email, password } = payload;

    const token = await this.adminsService.login(email, password);

    return {
      token,
    };
  }

  @Post('/createApiCredentials')
  @UseGuards(AdminsGuard)
  async createApiCredentials(
    @Body() payload: { publisherId: string; password: string },
  ) {
    const { publisherId, password } = payload;

    const apiKey = await this.publishersService.createApiCredentials(
      publisherId,
      password,
    );

    return {
      apiKey,
    };
  }

  @Post('/regenerateThumbnails')
  @UseGuards(AdminsGuard)
  async regenerateThumbnails() {
    await this.filesService.regenerateThumbnails();

    return {
      status: 'ok',
    };
  }
}
