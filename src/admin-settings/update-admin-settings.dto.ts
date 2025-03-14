import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateAdminSettingsDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  countries?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  @IsArray()
  @IsOptional()
  radioStreamList?: { url: string; description: string }[];
}
 