import { Controller, Get, Post, Put, Body, Param, UseGuards, Headers } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingsDto } from './create-settings.dto';
import { UpdateSettingsDto } from './update-settings.dto';
import { AuthGuard } from '@nestjs/passport';
import { Settings } from './settings.model';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Pobieranie ustawień dla danego tenanta
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getSettings(@Headers('tenant-id') tenant_id: string): Promise<Settings> {
    if (!tenant_id) {
      throw new Error('Tenant ID is required');
    }
    return this.settingsService.getSettingsForTenant(tenant_id);
  }

  // Tworzenie domyślnych ustawień dla danego tenanta
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createDefaultSettings(@Headers('tenant-id') tenant_id: string): Promise<Settings> {
    if (!tenant_id) {
      throw new Error('Tenant ID is required');
    }
    return this.settingsService.createDefaultSettings(tenant_id);
  }

  // Aktualizacja ustawień dla danego tenanta
  @UseGuards(AuthGuard('jwt'))
  @Put()
  async updateSettings(
    @Body() updateSettingsDto: UpdateSettingsDto,
    @Headers('tenant-id') tenant_id: string,
  ): Promise<Settings> {
    if (!tenant_id) {
      throw new Error('Tenant ID is required');
    }
    return this.settingsService.updateSettingsForTenant(tenant_id, updateSettingsDto);
  }
}
