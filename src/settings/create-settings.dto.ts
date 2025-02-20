import { IsArray, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateSettingsDto {
  @IsOptional()
  @IsString()
  selectedRadioStream?: string;

  @IsOptional()
  @IsArray()
  radioStreamList?: { url: string; description: string }[];

  @IsOptional()
  @IsArray()
  footerVisibilityRules?: { startMinute: number; endMinute: number }[];

  @IsOptional()
  @IsNumber()
  pictureSlideDuration?: number;
}
