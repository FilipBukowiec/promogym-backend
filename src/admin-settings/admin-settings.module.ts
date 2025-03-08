import { Module } from '@nestjs/common';
import { AdminSettingsController } from './admin-settings.controller';
import { AdminSettingsService } from './admin-settings.service';

@Module({
  controllers: [AdminSettingsController],
  providers: [AdminSettingsService]
})
export class AdminSettingsModule {}
