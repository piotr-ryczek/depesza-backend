import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type FileDocument = File & Document;

@Schema()
export class File {
  _id: Types.ObjectId;

  @Prop()
  fileName: string;

  @Prop()
  createdAt: Date;
}

export const FileSchema = SchemaFactory.createForClass(File);
