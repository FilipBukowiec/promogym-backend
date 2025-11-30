import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PageDocument = Page & Document;

@Schema()
export class Page {
    @Prop({ required: true, unique: true })
    id: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    category: string;

    @Prop({ required: true })
    page_token: string;
}


export const PageSchema = SchemaFactory.createForClass(Page);