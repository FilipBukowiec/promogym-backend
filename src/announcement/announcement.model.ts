import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Announcement extends Document {
  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ['cyclic', 'oneTime'] })
  scheduleType: string;

  @Prop({
    required: function (this: Announcement) {
      return this.scheduleType === 'cyclic';
    },
    enum: ['everyDay', 'specificDay'],
  })
  scheduleOption?: string;

  @Prop({ type: [String], default: [] })
  selectedDays: string[];

  @Prop({ type: [String], default: [] })
  selectedHours: string[];

  @Prop({ type: [String], default: [] })
  selectedMinutes: string[];

  @Prop({ type: Date, default: null })
  scheduledTime: Date;

  @Prop({ default: '' })
  fileName: string;

  @Prop({ default: '' })
  cronSchedule: string;
}

export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);
