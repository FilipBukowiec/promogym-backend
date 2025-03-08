import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class UserSettings extends Document {
  @Prop({ required: true })
  tenant_id: string; // Nowe pole tenant_id

  @Prop({required: true  })
  language: string;

  @Prop({ required: true })
  name: string; // Nazwa ustawień

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      default: [0, 0],
    },
  })
  location: {
    type: 'Point';
    coordinates: [number, number]; // longitude, latitude
  };

  @Prop({ required: false })
  selectedRadioStream: string;

  @Prop({
    type: [
      {
        url: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
  })
  radioStreamList: { url: string; description: string }[];

  @Prop({
    type: [
      {
        startMinute: { type: Number, required: true },
        endMinute: { type: Number, required: true },
      },
    ],
    default: [],
  })
  footerVisibilityRules: { startMinute: number; endMinute: number }[];

  @Prop({ required: true })
  pictureSlideDuration: number;
}

export const SettingsSchema = SchemaFactory.createForClass(UserSettings);
