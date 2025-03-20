import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminSettings } from './admin-settings.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateAdminSettingsDto } from './create-admin-settings.dto';
import { UpdateAdminSettingsDto } from './update-admin-settings.dto';

@Injectable()
export class AdminSettingsService {
  constructor(
    @InjectModel(AdminSettings.name)
    private adminSettingsModel: Model<AdminSettings>,
  ) {}

  async getSettings(): Promise<AdminSettings> {
    console.log('🔍 Pobieram ustawienia admina');

    const settings = await this.adminSettingsModel.findOne().exec();

    if (!settings) {
      console.log('❌ Nie znaleziono ustawień admina');
      throw new NotFoundException('Settings not found');
    }

    console.log('✅ Znaleziono ustawienia:', settings);
    return settings;
  }

  async createSettings(): Promise<AdminSettings> {
    console.log('🔍 Tworzenie nowych ustawień admina');

    // Sprawdzamy, czy już istnieją jakieś ustawienia
    const existingSettings = await this.adminSettingsModel.findOne().exec();
    if (existingSettings) {
      console.log('⚠️ Ustawienia już istnieją:', existingSettings);
      throw new ConflictException('Settings already exist');
    }

    // Tworzymy nowe ustawienia na podstawie DTO
    const defaultSettings: CreateAdminSettingsDto = {
      languages: ['PL', 'ENG'], // Domyślnie PL i ENG
      countries: ['Poland'], // Domyślnie Polska
      radioStreamList: [], // Domyślnie pusta lista
    };

    // Tworzymy nowe ustawienia w bazie danych
    const newSettings = new this.adminSettingsModel(defaultSettings);
    return await newSettings.save();
  }

  async updateSettings(updateSettingsDto: UpdateAdminSettingsDto): Promise<AdminSettings> {
    console.log('🔍 Aktualizowanie ustawień admina');

    // Szukamy istniejących ustawień
    const settings = await this.adminSettingsModel.findOne().exec();
    if (!settings) {
        throw new NotFoundException('Settings not found');
    }

    console.log('🔍 Aktualne ustawienia:', settings);

    // 🔹 Sortujemy tablice, jeśli są przekazane
    settings.languages = updateSettingsDto.languages 
        ? [...updateSettingsDto.languages].sort() 
        : settings.languages;

    settings.countries = updateSettingsDto.countries 
        ? [...updateSettingsDto.countries].sort() 
        : settings.countries;

    settings.radioStreamList = updateSettingsDto.radioStreamList ?? settings.radioStreamList;

    // Zapisujemy zmiany w bazie
    const updatedSettings = await settings.save();

    console.log('✅ Zaktualizowane ustawienia:', updatedSettings);
    return updatedSettings;
}

}
