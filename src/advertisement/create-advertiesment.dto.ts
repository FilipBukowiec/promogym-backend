import { IsString, IsArray } from 'class-validator';

export class CreateAdvertisementDto {
  @IsString()
  readonly fileName: string;

  @IsString()
  readonly filePath: string;

  @IsString()
  readonly fileType: string;

  @IsArray()
  @IsString({each:true})
  readonly languages: string[];
}
