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
  @IsNumber({}, { each: true })
  coordinates: [number, number];
}

export class UpdateUserSettingsDto {
  @IsOptional()
  @IsString()
  tenant_id?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  name?: string;

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

  @IsOptional()
  @IsString()
  mainLogoUrl?: string;

  @IsOptional()
  @IsString()
  separatorLogoUrl?: string;
}
