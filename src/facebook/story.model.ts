// NestJS: story.model.ts (lub podobnie nazwany plik)

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StoryDocument = Story & Document;

@Schema()
export class Story {
  @Prop({ required: true })
  mediaType: 'photo' | 'video';

  @Prop({ required: true })
  mediaUrl: string;
}

export const StorySchema = SchemaFactory.createForClass(Story);
