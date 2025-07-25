import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateAdvertisementDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  readonly countries?: string[];
}
