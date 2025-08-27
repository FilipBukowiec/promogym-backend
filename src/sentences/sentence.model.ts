import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Sentence extends Document{

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  order: number;
}

export const SentenceSchema = SchemaFactory.createForClass(Sentence);
