import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateAdvertisementDto {
  @IsString()
  readonly fileName: string;

  @IsString()
  readonly filePath: string;

  @IsString()
  readonly fileType: string;

  @IsArray()
  @IsString({each:true})
  @IsOptional()
  readonly countries?: string[];
}
