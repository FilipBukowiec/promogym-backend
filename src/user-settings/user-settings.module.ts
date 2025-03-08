import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSettingsService } from './user-settings.service';
import { SettingsController } from './user-settings.controller';
import { UserSettings, SettingsSchema } from './user-settings.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserSettings.name, schema: SettingsSchema }]),
  ],
  providers: [UserSettingsService],
  controllers: [SettingsController],
  exports: [UserSettingsService], // jeśli musisz eksportować serwis
})
export class SettingsModule {}
