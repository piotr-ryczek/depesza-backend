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
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
      }),
    });
  }

  async sendEmailVerificationCode(email: string, code: string): Promise<void> {
    const body = `
    <p><a href="${process.env.APP_NAME_DEEP_LINK}/confirmEmail/${code}">Otwórz link w aplikacji na swoim telefonie z Androidem</a></p>
    <p>Jeśli link z jakiegoś powodu jest niewidoczny możesz ręcznie aktywować konto w aplikacji z użyciem tego kodu: <strong>${code}</strong></p>
    `;

    await this.sendEmail(email, 'Zweryfikuj swój email', body);
  }

  async sendEmail(email: string, subject: string, body: string): Promise<void> {
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
