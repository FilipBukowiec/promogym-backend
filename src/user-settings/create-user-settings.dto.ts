import {
  IsArray,
  IsOptional,
  IsString,
  IsNumber,
  ValidateNested,
} from 'class-validator';
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

  @IsString()
  country: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  @IsString()
  selectedRadioStream?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  footerVisibilityRules?: { startMinute: number; endMinute: number }[];

  @IsOptional()
  @IsNumber()
  pictureSlideDuration?: number;

  @IsOptional()
  @IsString()
  logoFileName?: string;

  @IsOptional()
  @IsString()
  logoFilePath?: string;

  @IsOptional()
  @IsString()
  logoFileType?: string;

  @IsOptional()
  @IsString()
  separatorFileName?: string;

  @IsOptional()
  @IsString()
  separatorFilePath?: string;

  @IsOptional()
  @IsString()
  separatorFileType?: string;
}
