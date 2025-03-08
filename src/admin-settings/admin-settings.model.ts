import { Prop, Schema } from "@nestjs/mongoose";

@Schema()
export class AdminSettings extends Document{
@Prop({required: true})
tenant_id: string;




}