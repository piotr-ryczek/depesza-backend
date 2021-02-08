import { Algorithm } from 'jsonwebtoken';

import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { Admin, AdminSchema } from 'src/schemas/admin.schema';

import { AdminsService } from './admins.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: {
          algorithm: process.env.JWT_ALGORITHM as Algorithm,
        },
      }),
    }),
  ],
  providers: [AdminsService],
  exports: [AdminsService],
})
export class AdminsModule {}
