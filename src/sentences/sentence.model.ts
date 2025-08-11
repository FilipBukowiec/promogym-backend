import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SentenceDocument = Sentence & Document;

@Schema()
export class Sentence {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  order: number;
}

export const SentenceSchema = SchemaFactory.createForClass(Sentence);
