import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserSettings } from './user-settings.model';
import { CreateUserSettingsDto } from './create-user-settings.dto';
import { UpdateUserSettingsDto } from './update-user-settings.dto';

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectModel(UserSettings.name)
    private userSettingsModel: Model<UserSettings>,
  ) {}

  // Pobieranie ustawień dla danego tenant_id
  async getSettingsForTenant(tenant_id: string): Promise<UserSettings> {
    console.log('Pobieram ustawienia dla tenant_id:', tenant_id); // Logowanie tenant_id

    // Szukamy ustawień dla danego tenant_id
    const settings = await this.userSettingsModel.findOne({ tenant_id }).exec();

    if (!settings) {
      console.log(`Nie znaleziono ustawień dla tenant_id: ${tenant_id}`); // Logowanie w przypadku, gdy nie znaleziono ustawień
      throw new NotFoundException('Settings not found');
    }

    console.log(`Znaleziono ustawienia dla tenant_id: ${tenant_id}`, settings); // Logowanie znalezionych ustawień

    return settings;
  }
  // Tworzenie nowych ustawień dla danego tenant_id
  async createDefaultSettings(
    tenant_id: string,
    country: string,
  ): Promise<UserSettings> {
    const defaultSettings: CreateUserSettingsDto = {
      tenant_id,
      language: 'ENG',
      country: country,
      name: tenant_id,
      selectedRadioStream: '',
      radioStreamList: [],
      footerVisibilityRules: [],
      pictureSlideDuration: 15,
      location: { type: 'Point', coordinates: [0, 0] },
    };

    const settings = new this.userSettingsModel(defaultSettings);
    await settings.save();
    return settings;
  }

  // Aktualizacja ustawień
  async updateSettingsForTenant(
    tenant_id: string,
    country: string,
    updateSettingsDto: UpdateUserSettingsDto,
  ): Promise<UserSettings> {
    const settings = await this.userSettingsModel.findOne({ tenant_id }).exec();
    if (!settings) {
      throw new NotFoundException('Settings not found');
    }

    console.log('Aktualne ustawienia:', settings);

    settings.language = updateSettingsDto.language ?? settings.language;
    settings.country = updateSettingsDto.country ?? settings.country;
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

    settings.country = country || settings.country;

    console.log('Nowe ustawienie country:', settings.country);

    await settings.save();
    return settings;
  }
}
