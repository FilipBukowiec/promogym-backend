import {
  IsArray,
  IsOptional,
  IsString,
  IsNumber,
  ValidateNested,
  IsBoolean,
  isString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserSettingsDto {
  @IsString()
  tenant_id: string;

  @IsString()
  language: string;

  @IsString()
  name: string;

  @IsString()
  country: string;

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

  @IsOptional()
  @IsBoolean()
  enableFacebookModule?: boolean;

  @IsOptional()
  @IsString()
  selectedFacebookPage?: string;

  @IsOptional()
  @IsString()
  facebookPageAccess?: string;

  @IsOptional()
  @IsString()
  facebookPageId?: string;
}
