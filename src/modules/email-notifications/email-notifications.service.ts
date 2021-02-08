import { SES } from 'aws-sdk';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs/promises';

import { emailRegexp } from 'src/lib/helpers';
import { ApiException } from 'src/lib/exceptions/api.exception';
import ErrorCode from 'src/lib/error-code';

export class EmailNotificationsService {
  public transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      SES: new SES({
        accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
      }),
    });
  }

  async sendEmailVerificationCode(email, code) {
    const body = `<a href="${process.env.APP_NAME_DEEP_LINK}/verify-email?verificationCode=${code}">Otwórz link w aplikacji na swoim telefonie z Androidem</a>`;

    await this.sendEmail(email, 'Zweryfikuj swój email', body);
  }

  async sendEmail(email, subject, body) {
    if (!emailRegexp.test(email)) {
      throw new ApiException(ErrorCode.INCORRECT_EMAIL, 409);
    }

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM_HEADER, // TOOD: Change
        to: email,
        subject,
        html: body,
      });
    } catch (error) {
      console.log(error); // TODO:
      throw new ApiException(ErrorCode.EMAIL_HAS_NOT_BEEN_SEND, 500);
    }
  }

  // async sendEmailWithAttachment(email, subject, body, fileName, fileContent) {
  //   if (!emailRegexp.test(email)) {
  //     throw new ApiException(ErrorCode.INCORRECT_EMAIL, 409);
  //   }

  //   try {
  //     await this.transporter.sendMail({
  //       from: process.env.EMAIL_FROM_HEADER, // TOOD: Change
  //       to: email,
  //       subject,
  //       attachments: [
  //         {
  //           filename: fileName, // fileName,
  //           content: fileContent,
  //         },
  //       ],
  //       alternatives: [
  //         {
  //           filename: fileName, // fileName,
  //           content: fileContent,
  //         },
  //       ],
  //     });
  //   } catch (error) {
  //     console.log(error); // TODO:

  //     throw new ApiException(ErrorCode.EMAIL_HAS_NOT_BEEN_SEND, 500);
  //   }
  // }
}
