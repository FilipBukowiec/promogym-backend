import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Advertisement extends Document{
@Prop({required: true})
fileName: string;

@Prop({required: true})
filePath: string;

@Prop({required: true})
filetype:string;

@Prop({required: true})
order: number;

@Prop({required: true})
language: string;

}

export const AdvertisementSchema = SchemaFactory.createForClass(Advertisement);