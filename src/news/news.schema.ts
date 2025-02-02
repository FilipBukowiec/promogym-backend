import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";


export type NewsDocument = News & Document;

@Schema()
export class News {
    @Prop({ reqired: true})
    content: string;
 
    @Prop({required: true})
    order: number;

    @Prop({required: true})
    tenantId: string;
}
export const NewsSchema = SchemaFactory.createForClass(News);


