import { IsString } from 'class-validator';

export class CreateMediaDto {
  @IsString()
  readonly tenant_id: string;

  @IsString()
  readonly fileName: string;

  @IsString()
  readonly filePath: string;

  @IsString()
  readonly fileType: string;


}
