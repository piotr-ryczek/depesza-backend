import { Response } from 'express';
import {
  Controller,
  Get,
  UseFilters,
  Inject,
  forwardRef,
  Res,
  Query,
  Param,
} from '@nestjs/common';

import { ApiExceptionFilter } from 'src/lib/exceptions/api-exception.filter';
import { S3Service } from './modules/s3/s3.service';

@Controller('/images')
@UseFilters(new ApiExceptionFilter())
export class ImagesController {
  constructor(
    @Inject(forwardRef(() => S3Service))
    private readonly s3Service: S3Service,
  ) {}

  @Get('/:fileName')
  async getImage(
    @Res() res: Response,
    @Param('fileName') fileName: string,
    @Query('fileSize') fileSize: string,
  ) {
    const file = await this.s3Service.getFile(fileName, fileSize);

    const { ContentType, Body } = file;

    res.set('Content-Type', ContentType).send(Body);
  }
}
