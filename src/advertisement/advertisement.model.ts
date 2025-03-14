import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Advertisement extends Document {
  @Prop({ required: true })
  order: number;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  filePath: string;

  @Prop({ required: true })
  fileType: string;

  @Prop({ required: true, type: [String] })
  countries: string[];
}

export const AdvertisementSchema = SchemaFactory.createForClass(Advertisement);
