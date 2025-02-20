import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { Settings, SettingsSchema } from './settings.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Settings.name, schema: SettingsSchema }]),
  ],
  providers: [SettingsService],
  controllers: [SettingsController],
  exports: [SettingsService], // jeśli musisz eksportować serwis
})
export class SettingsModule {}
