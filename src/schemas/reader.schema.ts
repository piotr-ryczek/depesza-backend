import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Article } from './article.schema';
import { Region } from './region.schema';
import { AuthType } from 'src/types';

export type ReaderDocument = Reader & Document;

@Schema()
export class Reader {
  _id: Types.ObjectId;

  @Prop()
  authType: AuthType;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  emailVerificationCode: string;

  @Prop()
  hasAccess: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Article', default: [] })
  toReadArticles: Types.ObjectId[] | Article[];

  @Prop({ type: Types.ObjectId, ref: 'Article', default: [] })
  readedArticles: Types.ObjectId[] | Article[];

  @Prop({ type: Types.ObjectId, ref: 'Region', default: [] })
  followedRegions: Types.ObjectId[] | Region[];

  @Prop()
  createdAt: Date;
}

export const ReaderSchema = SchemaFactory.createForClass(Reader);
