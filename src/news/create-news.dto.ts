import { IsString, IsNumber } from 'class-validator';

export class CreateNewsDto {
  @IsString()
  readonly tenant_id: string;

  @IsString()
  readonly content: string;

  @IsNumber()
  readonly order: number;
}