import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true, enum: ['user', 'admin'], default: 'user' })
  role: 'user' | 'admin';
}
export const UserSchema = SchemaFactory.createForClass(User);
