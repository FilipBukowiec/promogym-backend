import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Settings extends Document {
  @Prop({ required: false })
  selectedRadioStream: string;

  @Prop({ type: [{ url: { type: String, required: true }, description: { type: String, required: true } }] })
  radioStreamList: { url: string, description: string }[];

  @Prop({ 
    type: [
      {
        startMinute: { type: Number, required: true },
        endMinute: { type: Number, required: true },
      }
    ], 
    default: [], 
  })
  footerVisibilityRules: { startMinute: number, endMinute: number }[];

  @Prop({ required: true })
  pictureSlideDuration: number;

  @Prop({ required: true })
  tenant_id: string;  // Nowe pole tenant_id
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
