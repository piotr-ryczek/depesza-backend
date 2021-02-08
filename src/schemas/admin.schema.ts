import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type AdminDocument = Admin & Document;

@Schema()
export class Admin {
  _id: Types.ObjectId;

  @Prop()
  email: string;

  @Prop()
  password: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
