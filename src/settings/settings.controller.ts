import { Controller, Get, Post, Put, Body, Param, UseGuards, Headers } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingsDto } from './create-settings.dto';
import { UpdateSettingsDto } from './update-settings.dto';
import { AuthGuard } from '@nestjs/passport';
import { Settings } from './settings.model';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Tworzenie nowych ustawień dla danego tenanta (z ochroną)
  @UseGuards(AuthGuard('jwt'))
  @Post(':id')
  async create(@Param('id') id: string, @Body() createSettingsDto: CreateSettingsDto) {
    return this.settingsService.createSettingsForTenant(id, createSettingsDto); 
  }

  // Pobieranie ustawień dla danego tenanta
  @Get(':id')
  async getSettings(@Param('id') id: string): Promise<Settings> {
    return this.settingsService.getSettingsForTenant(id);
  }

  // Aktualizacja ustawień dla danego tenanta
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async updateSettings(
    @Param('id') id: string,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ): Promise<Settings> {
    return this.settingsService.updateSettingsForTenant(id, updateSettingsDto);
  }
}
