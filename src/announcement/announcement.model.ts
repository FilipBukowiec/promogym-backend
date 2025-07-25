import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Announcement extends Document {
  _id: Types.ObjectId;

  @Prop({ required: true })
  tenant_id: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: String, required: false, enum: ['cyclic', 'oneTime'] })
  scheduleType?: string;

  @Prop({ type: [Number], default: [] })
  selectedDays: number[];

  @Prop({ type: [Number], default: [] })
  selectedHours: number[];

  @Prop({ type: [Number], default: [] })
  selectedMinutes: number[];

  @Prop({ type: Date, default: null })
  scheduledTime: Date;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  filePath: string;

  @Prop({ required: true })
  fileType: string;

  @Prop({ default: '' })
  cronSchedule: string;
}

export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);
