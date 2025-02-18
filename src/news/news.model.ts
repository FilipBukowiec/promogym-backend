import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class News extends Document {
  @Prop({ required: true })
  tenant_id: string; // Zmieniono na tenant_id

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  order: number;
  
}

export const NewsSchema = SchemaFactory.createForClass(News);
