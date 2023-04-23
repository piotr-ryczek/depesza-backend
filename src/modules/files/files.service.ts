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
    const uploadsDir = path.resolve(config.uploadPath);
    const uploadsSizesDirs = config.imageWidths.map((width) =>
      path.resolve(`${config.uploadPath}/w${width}`),
    );

    const allPaths = [uploadsDir, ...uploadsSizesDirs];

    // Synchronized as we want to start with base path
    for await (const path of allPaths) {
      try {
        await fs.access(path);
      } catch (error) {
        await fs.mkdir(path);
      }
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

    await this.generateThumbnails([finalFilename]);

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

  async regenerateThumbnails(): Promise<void> {
    const files = await this.FileModel.find({});
    const fileNames = files.map(({ fileName }) => fileName);

    await this.generateThumbnails(fileNames);
  }

  private async generateThumbnails(fileNames: string[]): Promise<void> {
    const resizePromises = fileNames.reduce((acc, fileName) => {
      return [
        ...acc,
        ...config.imageWidths.map(
          (width) =>
            new Promise(async (resolve, reject) => {
              try {
                const finalPath = `uploads/${fileName}`;

                const resizePath = `uploads/w${width}/${fileName}`;

                const jimpImage = await Jimp.read(finalPath);
                jimpImage
                  .resize(width, Jimp.AUTO)
                  .quality(85)
                  .write(resizePath);

                resolve(true);
              } catch (error) {
                console.log('Resize Error', error);
                reject(error);
              }
            }),
        ),
      ];
    }, []);

    try {
      await Promise.all(resizePromises);
    } catch (error) {
      console.log(error); // TODO:
      throw new ApiException(ErrorCode.FILE_RESIZE_ERROR, 503);
    }
  }
}
