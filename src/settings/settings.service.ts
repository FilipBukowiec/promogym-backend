import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings } from './settings.model';
import { CreateSettingsDto } from './create-settings.dto';  // Zaimportuj CreateSettingsDto
import { UpdateSettingsDto } from './update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(@InjectModel(Settings.name) private settingsModel: Model<Settings>) {}

  // Pobieranie ustawień dla danego tenant_id
  async getSettingsForTenant(tenant_id: string): Promise<Settings> {
    const settings = await this.settingsModel.findOne({ tenant_id }).exec();
    if (!settings) {
      throw new NotFoundException('Settings not found');
    }
    return settings;
  }

  // Tworzenie nowych ustawień dla danego tenant_id
  async createSettingsForTenant(tenant_id: string, createSettingsDto: CreateSettingsDto): Promise<Settings> {
    // Sprawdzamy, czy ustawienia już istnieją
    const existingSettings = await this.settingsModel.findOne({ tenant_id }).exec();
    if (existingSettings) {
      throw new ConflictException('Settings already exist for this tenant');
    }

    // Tworzymy nowe ustawienia
    const settings = new this.settingsModel({
      ...createSettingsDto,
      tenant_id,
    });

    await settings.save();
    return settings;
  }

  // Aktualizacja ustawień dla danego tenant_id
  async updateSettingsForTenant(tenant_id: string, updateSettingsDto: UpdateSettingsDto): Promise<Settings> {
    const settings = await this.settingsModel.findOne({ tenant_id }).exec();

    if (!settings) {
      throw new NotFoundException('Settings not found');
    }

    // Aktualizujemy tylko te właściwości, które są przekazane w DTO
    settings.selectedRadioStream = updateSettingsDto.selectedRadioStream ?? settings.selectedRadioStream;
    settings.radioStreamList = updateSettingsDto.radioStreamList ?? settings.radioStreamList;
    settings.footerVisibilityRules = updateSettingsDto.footerVisibilityRules ?? settings.footerVisibilityRules;
    settings.pictureSlideDuration = updateSettingsDto.pictureSlideDuration ?? settings.pictureSlideDuration;

    await settings.save();
    return settings;
  }
}
