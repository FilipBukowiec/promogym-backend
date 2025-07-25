import {
  IsString, IsEnum, IsOptional, IsArray, IsDateString, IsNotEmpty, ValidateIf, IsInt
} from 'class-validator';

export class CreateAnnouncementDto {
  @IsString()
  readonly tenant_id: string;

  @IsString()
  readonly fileName: string;

  @IsString()
  readonly filePath: string;

  @IsString()
  readonly fileType: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsEnum(['cyclic', 'oneTime'])
  scheduleType?: 'cyclic' | 'oneTime';

  @ValidateIf(o => o.scheduleType === 'cyclic')
  @IsArray()
  @IsInt({ each: true })
  selectedDays?: number[]; 

  @ValidateIf(o => o.scheduleType === 'cyclic')
  @IsArray()
  @IsInt({ each: true })
  selectedHours?: number[]; 

  @ValidateIf(o => o.scheduleType === 'cyclic')
  @IsArray()
  @IsInt({ each: true })
  selectedMinutes?: number[];

  @ValidateIf(o => o.scheduleType === 'oneTime')
  @IsDateString()
  scheduledTime?: string;
}
