import { IsArray, IsOptional, IsString, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  @IsString()
  type: 'Point';

  @IsArray()
  @IsNumber({}, { each: true }) // Każdy element tablicy musi być liczbą
  coordinates: [number, number]; // longitude, latitude
}

export class CreateUserSettingsDto {
  @IsString()
  tenant_id: string; // Tenant ID jest wymagany

  @IsString()
  language: string;

  @IsString()
  name: string; // Name jest wymagane

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto; // Obsługa współrzędnych GPS

  @IsOptional()
  @IsString()
  selectedRadioStream?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  radioStreamList?: { url: string; description: string }[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  footerVisibilityRules?: { startMinute: number; endMinute: number }[];

  @IsOptional()
  @IsNumber()
  pictureSlideDuration?: number;
}
