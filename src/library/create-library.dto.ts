import { IsString } from 'class-validator';

export class CreateLibraryDto {
  @IsString()
  readonly fileName: string;

  @IsString()
  readonly filePath: string;

  @IsString()
  readonly fileType: string;
}
