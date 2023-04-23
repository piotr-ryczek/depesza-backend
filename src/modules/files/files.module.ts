import { MongooseModule } from '@nestjs/mongoose';
import { Module, HttpModule, forwardRef } from '@nestjs/common';

import { File, FileSchema } from 'src/schemas/file.schema';
import { S3Module } from 'src/modules/s3/s3.module';

import { FilesService } from './files.service';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
    forwardRef(() => S3Module),
  ],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
