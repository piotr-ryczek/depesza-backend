import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';

import { ReaderDocument, Reader } from 'src/schemas/reader.schema';
import { ApiException } from 'src/lib/exceptions/api.exception';
import ErrorCode from 'src/lib/error-code';
import { emailRegexp } from 'src/lib/helpers';
import { AuthType } from 'src/types';

export class ReadersService {
  constructor(
    @InjectModel(Reader.name)
    private readonly ReaderModel: Model<ReaderDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async loginByEmail(email, password) {
    const reader = await this.ReaderModel.findOne({ email });

    if (!reader) {
      throw new ApiException(ErrorCode.READER_DOES_NOT_EXIST, 403);
    }

    const { password: passwordHash } = reader;

    if (!bcrypt.compareSync(password, passwordHash)) {
      throw new ApiException(ErrorCode.INCORRECT_PASSWORD, 403);
    }

    return this.getToken(reader);
  }

  async registerbyEmail(
    email,
    password,
    repeatPassword,
  ): Promise<ReaderDocument> {
    this.validatePassword(password, repeatPassword);
    await this.validateEmail(email);

    const passwordHash = await bcrypt.hash(
      password,
      +process.env.PASSWORD_SALT_ROUNDS,
    );

    const emailVerificationCode = randomBytes(15).toString('hex');

    const newReader = new this.ReaderModel({
      email,
      hasAccess: false,
      emailVerificationCode,
      password: passwordHash,
      authType: AuthType.EMAIL,
    });

    await newReader.save();

    return newReader;
  }

  async verifyEmail(emailVerificationCode) {
    const response = await this.ReaderModel.updateOne(
      { emailVerificationCode },
      { hasAccess: true },
    );

    if (!response) {
      throw new ApiException(ErrorCode.EMAIL_VERIFICATION_FAILED, 403);
    }

    return true;
  }

  validatePassword(password, repeatPassword) {
    const validationErrors = [];

    if (password.length < 8) {
      validationErrors.push('PASSWORD_TOO_SHORT');
    }

    if (password !== repeatPassword) {
      validationErrors.push('PASSWORDS_DOES_NOT_MATCH');
    }

    if (validationErrors.length) {
      throw new ApiException(
        ErrorCode.INCORRECT_PASSWORD,
        422,
        validationErrors,
      );
    }

    return true;
  }

  async validateEmail(email) {
    if (!emailRegexp.test(email)) {
      throw new ApiException(ErrorCode.INCORRECT_EMAIL, 422);
    }

    const ifReaderExists = await this.ReaderModel.countDocuments({ email });

    if (ifReaderExists) {
      throw new ApiException(ErrorCode.READER_WITH_EMAIL_ALREADY_EXISTS, 422);
    }

    return true;
  }

  getToken(reader: ReaderDocument) {
    const { _id: readerId, hasAccess, authType } = reader;

    const token = this.jwtService.sign({
      readerId,
      hasAccess,
      authType,
    });

    return token;
  }
}
