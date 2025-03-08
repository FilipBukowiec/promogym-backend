import { Controller, Get, Post, Put, Body, Param, UseGuards, Headers } from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { UpdateUserSettingsDto } from './update-user-settings.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserSettings } from './user-settings.model';

@Controller('user-settings')
export class SettingsController {
  constructor(private readonly settingsService: UserSettingsService) {}

  // Pobieranie ustawień dla danego tenanta
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getSettings(@Headers('tenant-id') tenant_id: string): Promise<UserSettings> {
    if (!tenant_id) {
      throw new Error('Tenant ID is required');
    }
    return this.settingsService.getSettingsForTenant(tenant_id);
  }

  // Tworzenie domyślnych ustawień dla danego tenanta
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createDefaultSettings(@Headers('tenant-id') tenant_id: string): Promise<UserSettings> {
    if (!tenant_id) {
      throw new Error('Tenant ID is required');
    }
    return this.settingsService.createDefaultSettings(tenant_id);
  }

  // Aktualizacja ustawień dla danego tenanta
  @UseGuards(AuthGuard('jwt'))
  @Put()
  async updateSettings(
    @Body() updateSettingsDto: UpdateUserSettingsDto,
    @Headers('tenant-id') tenant_id: string,
  ): Promise<UserSettings> {
    if (!tenant_id) {
      throw new Error('Tenant ID is required');
    }
    return this.settingsService.updateSettingsForTenant(tenant_id, updateSettingsDto);
  }
}
