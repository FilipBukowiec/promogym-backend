import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Media extends Document {
  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  filePath: string;

  @Prop({ required: true })
  fileType: string;

  @Prop({ required: true })
  order: number;

  @Prop({ required: true })
  tenant_id: string;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
