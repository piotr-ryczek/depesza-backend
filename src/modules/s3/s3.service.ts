import { S3 } from 'aws-sdk';
import { PutObjectRequest } from 'aws-sdk/clients/s3';

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

import config from 'src/lib/config';
import { ApiException } from 'src/lib/exceptions/api.exception';
import ErrorCode from 'src/lib/error-code';

@Injectable()
export class S3Service implements OnModuleInit {
  private s3: S3;

  async onModuleInit() {
    this.s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });

    this.checkDirectories();
  }

  async checkDirectories() {
    const basePath = process.env.AWS_S3_FOLDER;
    const fullPath = `${process.env.AWS_S3_FOLDER}/full`;
    const resizePaths = config.imageWidths.map(
      (width) => `${process.env.AWS_S3_FOLDER}/w${width}`,
    );

    const allPaths = [basePath, fullPath, ...resizePaths];

    for await (const path of allPaths) {
      try {
        const foundObjects = await this.s3
          .listObjectsV2({
            Bucket: process.env.AWS_S3_BUCKET,
            Prefix: path,
            Delimiter: '/',
          })
          .promise();

        if (!foundObjects.KeyCount) {
          await this.s3
            .putObject({ Bucket: process.env.AWS_S3_BUCKET, Key: `${path}/` })
            .promise();
        }
      } catch (error) {
        Logger.error(error);
      }
    }
  }
  async uploadFile(fileName: string, buffer: Buffer, fileSize = 'full') {
    const folderName = fileSize === 'full' ? 'full' : `w${fileSize}`;

    const s3Params: PutObjectRequest = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `${process.env.AWS_S3_FOLDER}/${folderName}/${fileName}`,
      Body: buffer,
    };

    try {
      await this.s3.putObject(s3Params).promise();
    } catch (error) {
      Logger.error(error);
      throw new ApiException(ErrorCode.S3_UPLOAD_ISSUE, 503);
    }
  }

  async getFile(
    fileName: string,
    fileSize = 'full',
  ): Promise<S3.GetObjectOutput> {
    const folderName = fileSize === 'full' ? 'full' : `w${fileSize}`;

    const s3Params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `${process.env.AWS_S3_FOLDER}/${folderName}/${fileName}`,
    };

    try {
      const file = await this.s3.getObject(s3Params).promise();

      return file;
    } catch (error) {
      Logger.error(error);
      throw new ApiException(ErrorCode.FILE_DOES_NOT_EXIST, 404);
    }
  }
}
