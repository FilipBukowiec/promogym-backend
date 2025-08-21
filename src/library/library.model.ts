import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Library extends Document {
  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  filePath: string;

  @Prop({ required: true })
  fileType: string;

  @Prop({ required: true })
  order: number;

  @Prop()
  tenantIds: string[];
}

export const LibrarySchema = SchemaFactory.createForClass(Library);
