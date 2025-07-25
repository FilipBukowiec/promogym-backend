import { Module } from '@nestjs/common';
import { AdminSettingsController } from './admin-settings.controller';
import { AdminSettingsService } from './admin-settings.service';
import { AdminSettings, AdminSettingsSchema } from './admin-settings.model';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminSettingsGateway } from './admin-settings.gateway';

@Module({
  imports: [MongooseModule.forFeature([{name: AdminSettings.name, schema:AdminSettingsSchema}])],
  controllers: [AdminSettingsController],
  providers: [AdminSettingsService, AdminSettingsGateway]
})
export class AdminSettingsModule {}
