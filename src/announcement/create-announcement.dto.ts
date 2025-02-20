import { IsString, IsEnum, IsOptional, IsArray, IsDateString } from 'class-validator';

export class CreateAnnouncementDto {
  @IsString()
  description: string;

  @IsEnum(['cyclic', 'oneTime'])
  scheduleType: 'cyclic' | 'oneTime';

  @IsOptional()
  @IsEnum(['everyDay', 'specificDay'])
  scheduleOption?: 'everyDay' | 'specificDay';

  @IsOptional()
  @IsArray()
  selectedDays?: string[];

  @IsOptional()
  @IsArray()
  selectedHours?: string[];

  @IsOptional()
  @IsArray()
  selectedMinutes?: string[];

  @IsOptional()
  @IsDateString()
  scheduledTime?: string;
}
