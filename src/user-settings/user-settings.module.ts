import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSettingsService } from './user-settings.service';
import { UserSettingsController } from './user-settings.controller';
import { UserSettings, SettingsSchema } from './user-settings.model';
import { UserSettingsGateway } from './user-settings.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserSettings.name, schema: SettingsSchema }]),
  ],
  providers: [UserSettingsService, UserSettingsGateway],
  controllers: [UserSettingsController],
  exports: [UserSettingsService], 
})
export class SettingsModule {}
