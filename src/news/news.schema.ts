// src/news/news.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class News extends Document {
  @Prop({ required: true })
  order: number; // Kolejność wyświetlania wiadomości

  @Prop({ required: true })
  content: string; // Treść wiadomości

  @Prop({ required: true })
  tenantId: string; // Powiązanie wiadomości z tenantem

  @Prop({ default: Date.now })
  createdAt: Date; // Data utworzenia wiadomości
}

// Tworzymy schemat
export const NewsSchema = SchemaFactory.createForClass(News);
