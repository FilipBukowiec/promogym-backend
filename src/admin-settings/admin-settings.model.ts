import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
class RadioStream {
  @Prop({ requirded: true })
  url: string;
  @Prop({ required: true })
  description: string;
}

export const RadioStreamSchema = SchemaFactory.createForClass(RadioStream);

@Schema()
export class AdminSettings extends Document {
  @Prop({ type: [String], required: true })
  languages: string[];

  @Prop({ type: [RadioStreamSchema], required: true })
  radioStreamList: RadioStream[];
}
