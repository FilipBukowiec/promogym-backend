import { PartialType } from '@nestjs/mapped-types';
import { CreateUserSettingsDto } from './create-user-settings.dto';



export class UpdateUserSettingsDto extends PartialType(CreateUserSettingsDto) { }
