import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type RegionDocument = Region & Document;

@Schema()
export class Region {
  _id: Types.ObjectId;

  @Prop()
  title: string;

  @Prop()
  continent: string;

  @Prop()
  iconUrl: string;
}

export const RegionSchema = SchemaFactory.createForClass(Region);
