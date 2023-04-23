import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, OnModuleInit } from '@nestjs/common';

import { ApiException } from 'src/lib/exceptions/api.exception';
import ErrorCode from 'src/lib/error-code';
import { Admin, AdminDocument } from 'src/schemas/admin.schema';

@Injectable()
export class AdminsService implements OnModuleInit {
  constructor(
    @InjectModel(Admin.name)
    private readonly AdminModel: Model<AdminDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    await this.checkForInitialAdmin();
  }

  async checkForInitialAdmin(): Promise<boolean> {
    const adminsCount = await this.AdminModel.countDocuments({});

    if (adminsCount) {
      return false;
    }

    const passwordHash = await bcrypt.hash(
      process.env.DEFAULT_ADMIN_PASSWORD,
      +process.env.PASSWORD_SALT_ROUNDS,
    );

    const newAdmin = new this.AdminModel({
      email: process.env.DEFAULT_ADMIN_EMAIL,
      password: passwordHash,
    });

    await newAdmin.save();

    return true;
  }

  async login(email: string, password: string): Promise<string> {
    const admin = await this.AdminModel.findOne({ email });

    if (!admin) {
      throw new ApiException(ErrorCode.ADMIN_DOES_NOT_EXIST, 403);
    }

    const { password: passwordHash } = admin;

    if (!bcrypt.compareSync(password, passwordHash)) {
      throw new ApiException(ErrorCode.INCORRECT_PASSWORD, 403);
    }

    const { _id: adminId } = admin;

    const token = this.jwtService.sign(
      {
        adminId,
      },
      { expiresIn: +process.env.JWT_EXPIRES_IN },
    );

    return token;
  }
}
