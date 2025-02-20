import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @IsString()
  @IsOptional()
  selectedRadioStream?: string;

  @IsArray()
  @IsOptional()
  radioStreamList?: { url: string; description: string }[];

  @IsArray()
  @IsOptional()
  footerVisibilityRules?: { startMinute: number; endMinute: number }[];

  @IsNumber()
  @IsOptional()
  pictureSlideDuration?: number;
}
