import { MongooseModule } from '@nestjs/mongoose';
import { Module, HttpModule } from '@nestjs/common';

import { File, FileSchema } from 'src/schemas/file.schema';

import { FilesService } from './files.service';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
  ],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
