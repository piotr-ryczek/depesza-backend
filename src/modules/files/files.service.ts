import { Model } from 'mongoose';
import { v4 } from 'uuid';
import * as mime from 'mime-types';
import * as Jimp from 'jimp';

import { InjectModel } from '@nestjs/mongoose';
import { Injectable, HttpService, Logger } from '@nestjs/common';

import config from 'src/lib/config';
import { ApiException } from 'src/lib/exceptions/api.exception';
import ErrorCode from 'src/lib/error-code';
import { File, FileDocument } from 'src/schemas/file.schema';
import { fileExtensionRegexp } from 'src/lib/helpers';
import { S3Service } from 'src/modules/s3/s3.service';

@Injectable()
export class FilesService {
  constructor(
    @InjectModel(File.name)
    private readonly FileModel: Model<FileDocument>,
    private httpService: HttpService,
    private s3Service: S3Service,
  ) {}

  /**
   * Intend to be used with controller passing multer File
   * @param file
   */
  async uploadFile(file: Express.Multer.File): Promise<string> {
    // TODO: Should be secured in interceptor for mimeType
    const { originalname, buffer } = file;

    const finalFinalName = await this.handleUpload(originalname, buffer);

    return finalFinalName;
  }

  async retrieveAndUploadFileFromUrl(fileUrl: string): Promise<string> {
    try {
      const { data } = await this.httpService
        .get(fileUrl, { responseType: 'arraybuffer' })
        .toPromise();

      const fileName = await this.handleUpload(fileUrl, data);

      return fileName;
    } catch (error) {
      // TODO: Proper error handling
      Logger.error(error);

      return null;
    }
  }

  async regenerateThumbnails(): Promise<void> {
    const files = await this.FileModel.find({});
    const fileNames = files.map(({ fileName }) => fileName);

    await this.generateThumbnails(fileNames);
  }

  private async handleUpload(originalFileName: string, buffer: Buffer) {
    const extension = this.extractExtension(originalFileName);
    const finalFilename = `${v4()}.${extension}`;

    await this.s3Service.uploadFile(finalFilename, buffer);
    await this.generateThumbnails([finalFilename]);

    const newFile = new this.FileModel({
      fileName: finalFilename,
      createdAt: new Date(),
    });

    await newFile.save();

    return finalFilename;
  }

  private extractExtension(fileName: string): string {
    const [, extension] = fileExtensionRegexp.exec(fileName);

    return extension;
  }

  private async fetchFileData(
    fileName: string,
  ): Promise<{ buffer: Buffer; mimeType: string; fileName: string }> {
    const mimeType = mime.lookup(fileName);
    const { Body } = await this.s3Service.getFile(fileName);

    return {
      buffer: Body as Buffer,
      mimeType,
      fileName,
    };
  }

  private async generateThumbnails(fileNames: string[]): Promise<void> {
    const filesData = await Promise.all(
      fileNames.map((fileName) => this.fetchFileData(fileName)),
    );

    const resizePromises = filesData.reduce(
      (acc, { buffer, mimeType, fileName }) => {
        return [
          ...acc,
          ...config.imageWidths.map(
            (width) =>
              new Promise(async (resolve, reject) => {
                try {
                  const jimpImage = await Jimp.read(buffer);
                  const jimpImageBuffer = await jimpImage
                    .resize(width, Jimp.AUTO)
                    .quality(85)
                    .getBufferAsync(mimeType);

                  await this.s3Service.uploadFile(
                    fileName,
                    jimpImageBuffer,
                    width.toString(),
                  );

                  resolve(true);
                } catch (error) {
                  Logger.error(error);
                  reject(error);
                }
              }),
          ),
        ];
      },
      [],
    );

    try {
      await Promise.all(resizePromises);
    } catch (error) {
      Logger.error(error);
      throw new ApiException(ErrorCode.FILE_RESIZE_ERROR, 503);
    }
  }
}
