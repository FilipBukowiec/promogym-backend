import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
class RadioStream {
  @Prop({ required: true })
  url: string;
  @Prop({ required: true })
  description: string;
}

export const RadioStreamSchema = SchemaFactory.createForClass(RadioStream);

@Schema()
export class AdminSettings extends Document {
  @Prop({ type: [String], required: true })
  countries: string[];

  @Prop({ type: [String], required: true })
  languages: string[];

  @Prop({ type: [RadioStreamSchema], required: true})
  radioStreamList: RadioStream[];
}

export const AdminSettingsSchema = SchemaFactory.createForClass(AdminSettings);
