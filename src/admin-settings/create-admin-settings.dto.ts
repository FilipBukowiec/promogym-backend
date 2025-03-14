import { IsArray, IsString } from 'class-validator';

export class CreateAdminSettingsDto {
  @IsArray()
  @IsString({ each: true })
  countries: string[];

  @IsArray()
  @IsString({ each: true })
  languages: string[];

  @IsArray()
  radioStreamList: { url: string; description: string }[];
}
