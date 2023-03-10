import { Model } from 'mongoose';
import { promises as fs } from 'fs';
import { v4 } from 'uuid';
import * as Jimp from 'jimp';
import * as path from 'path';

import { InjectModel } from '@nestjs/mongoose';
import { Injectable, HttpService, OnModuleInit } from '@nestjs/common';

import config from 'src/lib/config';
import { ApiException } from 'src/lib/exceptions/api.exception';
import ErrorCode from 'src/lib/error-code';
import { File, FileDocument } from 'src/schemas/file.schema';
import { fileExtensionRegexp } from 'src/lib/helpers';

@Injectable()
export class FilesService implements OnModuleInit {
  constructor(
    @InjectModel(File.name)
    private readonly FileModel: Model<FileDocument>,
    private httpService: HttpService,
  ) {}

  async onModuleInit() {
    await this.checkDirectories();
  }

  async checkDirectories() {
    const uploadsDir = path.resolve('uploads');

    try {
      await fs.access(uploadsDir);
    } catch (error) {
      await fs.mkdir(uploadsDir);
    }
  }

  async handleUpload(originalName: string, buffer: Buffer): Promise<string> {
    const [, extension] = fileExtensionRegexp.exec(originalName);

    const finalFilename = `${v4()}.${extension}`;
    const finalPath = `uploads/${finalFilename}`;

    try {
      await fs.writeFile(finalPath, buffer);
    } catch (error) {
      console.log(error); // TODO:
      throw new ApiException(ErrorCode.FILE_UPLOAD_ERROR, 503);
    }

    const resizePromises = config.imageWidths.map(
      (width) =>
        new Promise(async (resolve, reject) => {
          try {
            const resizePath = `uploads/w${width}/${finalFilename}`;

            const jimpImage = await Jimp.read(finalPath);
            await jimpImage
              .resize(width, Jimp.AUTO)
              .quality(85)
              .write(resizePath);

            resolve(true);
          } catch (error) {
            reject(error);
          }
        }),
    );

    try {
      await Promise.all(resizePromises);
    } catch (error) {
      console.log(error); // TODO:
      throw new ApiException(ErrorCode.FILE_RESIZE_ERROR, 503);
    }

    const newFile = new this.FileModel({
      fileName: finalFilename,
      createdAt: new Date(),
    });

    await newFile.save();

    return finalFilename;
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const { originalname, buffer } = file;

    const fileName = await this.handleUpload(originalname, buffer);

    return fileName;
  }

  async retrieveAndUploadFileFromUrl(fileUrl: string): Promise<string> {
    try {
      const { data } = await this.httpService
        .get(fileUrl, { responseType: 'arraybuffer' })
        .toPromise();

      const fileName = await this.handleUpload(fileUrl, data);

      return fileName;
    } catch (error) {
      // TODO:
      console.error(error);

      return null;
    }
  }
}
