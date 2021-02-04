import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Article } from './article.schema';

export type PublisherDocument = Publisher & Document;

@Schema()
export class Publisher {
  _id: Types.ObjectId;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  apiKey: string;

  @Prop()
  authors: string[];

  @Prop()
  logoUrl: string;

  @Prop()
  patroniteUrl: string;

  @Prop()
  facebookUrl: string;

  @Prop()
  twitterUrl: string;

  @Prop()
  www: string;

  @Prop({ type: Types.ObjectId, ref: 'Article', default: [] })
  articles: Types.ObjectId[] | Article[];

  @Prop({ type: Types.ObjectId, ref: 'Article', default: [] })
  articlesReported: Types.ObjectId[] | Article[];

  @Prop({ default: new Date() })
  createdAt: Date;
}

export const PublisherSchema = SchemaFactory.createForClass(Publisher);
