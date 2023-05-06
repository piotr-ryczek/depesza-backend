import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Article } from './article.schema';

export type PublisherDocument = Publisher & Document;

@Schema()
export class Publisher {
  _id: Types.ObjectId;

  @Prop()
  name: string; // Editable

  @Prop()
  description: string; // Editable

  @Prop()
  email: string;

  @Prop()
  initialCode: string;

  @Prop()
  password: string;

  @Prop()
  secondFactorSecret: string;

  @Prop()
  apiKey: string;

  @Prop()
  apiPassword: string;

  @Prop()
  authors: string[]; // Editable

  @Prop()
  logoUrl: string; // Editable

  @Prop()
  patroniteUrl: string; // Editable

  @Prop()
  patreonUrl: string; // Editable

  @Prop()
  buyCoffeeToUrl: string; // Editable

  @Prop()
  facebookUrl: string; // Editable

  @Prop()
  twitterUrl: string; // Editable

  @Prop()
  www: string; // Editable

  // Probably currently unused, its not populated in database
  @Prop({ type: Types.ObjectId, ref: 'Article', default: [] })
  articles: Types.ObjectId[] | Article[];

  @Prop({ type: Types.ObjectId, ref: 'Article', default: [] })
  articlesReported: Types.ObjectId[] | Article[];

  @Prop()
  createdAt: Date;
}

export const PublisherSchema = SchemaFactory.createForClass(Publisher);
