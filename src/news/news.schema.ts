import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type NewsDocument = News & Document;

@Schema()
export class News {
  @Prop()
  content: string;

  @Prop()
  order: number;

  @Prop()
  tenant_id: string;
}

export const NewsSchema = SchemaFactory.createForClass(News);
