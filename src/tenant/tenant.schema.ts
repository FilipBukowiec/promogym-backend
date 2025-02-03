// src/tenant/tenant.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Tenant extends Document {
  @Prop({ required: true })
  name: string; // Nazwa tenanta

  @Prop({ required: true, unique: true })
  tenantId: string; // Unikalny identyfikator tenanta

  @Prop({ required: true, enum: ['admin', 'user'] })
  role: string; // Rola w systemie: 'admin' lub 'user'
}

// Tworzymy schemat
export const TenantSchema = SchemaFactory.createForClass(Tenant);
