import { MongooseModule } from '@nestjs/mongoose';
import { Module, HttpModule } from '@nestjs/common';

import { File, FileSchema } from 'src/schemas/file.schema';

import { S3Service } from './s3.service';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
  ],
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {}
