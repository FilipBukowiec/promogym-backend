import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings } from './settings.model';
import { CreateSettingsDto } from './create-settings.dto';
import { UpdateSettingsDto } from './update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name) private settingsModel: Model<Settings>,
  ) {}

  // Pobieranie ustawień dla danego tenant_id
  async getSettingsForTenant(tenant_id: string): Promise<Settings> {
    console.log('Pobieram ustawienia dla tenant_id:', tenant_id);  // Logowanie tenant_id
    
    // Szukamy ustawień dla danego tenant_id
    const settings = await this.settingsModel.findOne({ tenant_id }).exec();
  
    if (!settings) {
      console.log(`Nie znaleziono ustawień dla tenant_id: ${tenant_id}`);  // Logowanie w przypadku, gdy nie znaleziono ustawień
      throw new NotFoundException('Settings not found');
    }
  
    console.log(`Znaleziono ustawienia dla tenant_id: ${tenant_id}`, settings);  // Logowanie znalezionych ustawień
  
    return settings;
  }
  // Tworzenie nowych ustawień dla danego tenant_id
  async createDefaultSettings(tenant_id: string): Promise<Settings> {
    const defaultSettings: CreateSettingsDto = {
      tenant_id,
      name: tenant_id,
      selectedRadioStream: '',
      radioStreamList: [],
      footerVisibilityRules: [],
      pictureSlideDuration: 5,
      location: { type: 'Point', coordinates: [0, 0] },
    };

    const settings = new this.settingsModel(defaultSettings);
    await settings.save();
    return settings;
  }

  // Aktualizacja ustawień
  async updateSettingsForTenant(
    tenant_id: string,
    updateSettingsDto: UpdateSettingsDto,
  ): Promise<Settings> {
    const settings = await this.settingsModel.findOne({ tenant_id }).exec();

    if (!settings) {
      throw new NotFoundException('Settings not found');
    }

    settings.name = updateSettingsDto.name ?? settings.name;
    settings.location = updateSettingsDto.location ?? settings.location;
    settings.selectedRadioStream =
      updateSettingsDto.selectedRadioStream ?? settings.selectedRadioStream;
    settings.radioStreamList =
      updateSettingsDto.radioStreamList ?? settings.radioStreamList;
    settings.footerVisibilityRules =
      updateSettingsDto.footerVisibilityRules ?? settings.footerVisibilityRules;
    settings.pictureSlideDuration =
      updateSettingsDto.pictureSlideDuration ?? settings.pictureSlideDuration;

    await settings.save();
    return settings;
  }
}
