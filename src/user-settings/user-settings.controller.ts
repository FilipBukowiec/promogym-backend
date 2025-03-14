import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Headers,
  UseGuards,
} from '@nestjs/common';
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
  async getSettings(
    @Headers('tenant-id') tenant_id: string,
  ): Promise<UserSettings> {
    if (!tenant_id) {
      console.error('Brak tenant-id w nagłówkach');
      throw new Error('Tenant ID is required');
    }
    console.log(`Pobrano ustawienia dla tenant-id: ${tenant_id}`);

    // Sprawdzamy, czy istnieją ustawienia dla danego tenanta
    const settings = await this.settingsService.getSettingsForTenant(tenant_id);

    if (!settings) {
      // Jeśli ustawienia nie istnieją, tworzymy domyślne
      console.log(
        `Brak ustawień dla tenant-id: ${tenant_id}. Tworzymy domyślne.`,
      );
    }

    return settings;
  }

  // Tworzenie domyślnych ustawień dla danego tenanta
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createDefaultSettings(
    @Headers('tenant-id') tenant_id: string,
    @Headers('country') country: string,
  ): Promise<UserSettings> {
    if (!tenant_id) {
      console.error('Brak tenant-id w nagłówkach');
      throw new Error('Tenant ID is required');
    }
    if (!country) {
      console.error('Brak country w nagłówkach');
      throw new Error('Country is required');
    }
    console.log(
      `Tworzenie domyślnych ustawień dla tenant-id: ${tenant_id} i country: ${country}`,
    );
    return this.settingsService.createDefaultSettings(tenant_id, country);
  }

  // Aktualizacja ustawień dla danego tenanta
  @UseGuards(AuthGuard('jwt'))
  @Put()
  async updateSettings(
    @Body() updateSettingsDto: UpdateUserSettingsDto,
    @Headers('tenant-id') tenant_id: string,
    @Headers('country') country: string,
  ): Promise<UserSettings> {
    if (!tenant_id) {
      console.error('Brak tenant-id w nagłówkach');
      throw new Error('Tenant ID is required');
    }
    if (!country) {
      console.error('Brak country w nagłówkach');
      throw new Error('Country is required');
    }

    console.log(
      `Aktualizacja ustawień dla tenant-id: ${tenant_id} i country: ${country}`,
    );

    // Sprawdzamy, czy ustawienia już istnieją
    let settings = await this.settingsService.getSettingsForTenant(tenant_id);

    if (!settings) {
      // Jeśli ustawienia nie istnieją, tworzymy domyślne
      console.log(
        `Brak ustawień dla tenant-id: ${tenant_id}. Tworzymy domyślne.`,
      );
      settings = await this.settingsService.createDefaultSettings(
        tenant_id,
        country,
      );
    }

    // Następnie aktualizujemy ustawienia
    return this.settingsService.updateSettingsForTenant(
      tenant_id,
      country,
      updateSettingsDto,
    );
  }
}
