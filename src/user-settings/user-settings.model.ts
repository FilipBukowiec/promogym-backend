import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class UserSettings extends Document {
  @Prop({ required: true, unique: true })
  tenant_id: string;

  @Prop({ required: true })
  language: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  selectedRadioStream: string;

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

  @Prop()
  logoFileName: string;

  @Prop()
  logoFilePath: string;

  @Prop()
  logoFileType: string;

  @Prop()
  separatorFileName: string;

  @Prop()
  separatorFilePath: string;

  @Prop()
  separatorFileType: string;

  @Prop()
  mainLogoUrl: string;

  @Prop()
  separatorLogoUrl: string;

  @Prop()
  enableFacebookModule: boolean;

  @Prop()
  selectedFacebookPage: string;

  @Prop()
  facebookPageAccess: string;

  @Prop()
  facebookPageId: string;
}

export const SettingsSchema = SchemaFactory.createForClass(UserSettings);

