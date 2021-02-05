import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Publisher } from './publisher.schema';
import { Region } from './region.schema';

export type ArticleDocument = Article & Document;

@Schema()
export class Article {
  _id: Types.ObjectId;

  @Prop()
  title: string;

  @Prop()
  excerpt: string;

  @Prop()
  content: string;

  @Prop()
  photoUrl: string;

  @Prop({ type: Types.ObjectId, ref: 'Publisher' })
  publishedBy: Types.ObjectId | Publisher;

  @Prop({ type: Types.ObjectId, ref: 'Region', required: true })
  region: Types.ObjectId | Region;

  @Prop()
  wordpressId: string;

  @Prop({ type: Types.ObjectId, ref: 'Publisher', default: [] })
  reportedBy: Types.ObjectId[] | Publisher[];

  @Prop({ default: new Date() })
  createdAt: Date;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
