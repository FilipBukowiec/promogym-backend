import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Headers,
  UseGuards,
  UsePipes,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { AdminSettingsService } from './admin-settings.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminSettings } from './admin-settings.model';
import { UpdateAdminSettingsDto } from './update-admin-settings.dto';

@Controller('admin-settings')
@UsePipes(new ValidationPipe({ transform: true }))
export class AdminSettingsController {
  constructor(private readonly settingsService: AdminSettingsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getSettings(
    @Headers('tenant-id') tenant_id: string,
  ): Promise<AdminSettings> {
    console.log('🔍 Otrzymano żądanie GET /admin-settings', tenant_id);

    if (!tenant_id) {
      console.error('❌ Brak tenant-id w nagłówkach');
      throw new BadRequestException('Missing tenant-id header');
    }

    console.log(`📡 Pobieranie ustawień dla tenant-id: ${tenant_id}`);

    let settings = await this.settingsService.getSettings();

    if (!settings) {
      console.log('❌ Brak ustawień. Tworzymy domyślne.');
    }

    console.log('✅ Ustawienia znalezione:', settings);
    return settings;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createDefaultSettings(
    @Headers('tenant-id') tenant_id: string,
  ): Promise<AdminSettings> {
    console.log('🔍 Otrzymano nagłówek tenant-id:', tenant_id);

    if (!tenant_id) {
      console.error('❌ Brak tenant-id w nagłówkach');
      throw new BadRequestException('Tenant ID is required');
    }

    console.log('📦 Tworzymy nowe ustawienia dla tenant-id:', tenant_id);
    return this.settingsService.createSettings();
  }

  @UseGuards(AuthGuard('jwt'))
  @Put()
  async updateSettings(
    @Headers('tenant-id') tenant_id: string,
    @Body() updateSettingsDto: UpdateAdminSettingsDto,
  ): Promise<AdminSettings> {
    if (!tenant_id) {
      throw new BadRequestException('Missing tenant-id header');
    }

    console.log('🔄 Aktualizowanie ustawień dla tenant-id:', tenant_id);

    return this.settingsService.updateSettings(updateSettingsDto);
  }
}
