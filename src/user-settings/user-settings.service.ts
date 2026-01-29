import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { UserSettings } from './user-settings.model';
import { CreateUserSettingsDto } from './create-user-settings.dto';
import { UpdateUserSettingsDto } from './update-user-settings.dto';

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectModel(UserSettings.name)
    private userSettingsModel: Model<UserSettings>,
  ) {}

  // Pomocnicza metoda do wyliczania pełnej ścieżki do pliku na dysku
  private getPhysicalPath(relativePath: string): string {
    if (!relativePath) return '';
    const basePath = process.env.NODE_ENV === 'production'
      ? path.join(__dirname, '..', '..', '..', 'public_html')
      : path.join(__dirname, '..', '..', 'public_html');
    return path.join(basePath, relativePath);
  }

  async getSettingsForTenant(tenant_id: string): Promise<UserSettings> {
    console.log('Pobieram ustawienia dla tenant_id:', tenant_id);
    const settings = await this.userSettingsModel.findOne({ tenant_id }).exec();
    if (!settings) {
      console.log(`Nie znaleziono ustawień dla tenant_id: ${tenant_id}`);
      throw new NotFoundException('Settings not found');
    }
    console.log(`Znaleziono ustawienia dla tenant_id: ${tenant_id}`, settings);
    return settings;
  }

  async createDefaultSettings(tenant_id: string, country: string): Promise<UserSettings> {
    const defaultSettings: CreateUserSettingsDto = {
      tenant_id,
      language: 'ENG',
      country,
      name: tenant_id,
      selectedRadioStream: '',
      footerVisibilityRules: [],
      pictureSlideDuration: 15,
      logoFilePath: '',
      separatorFilePath: '',
      enableFacebookModule: false,
      selectedFacebookPage: '',
      facebookPageAccess: '',
      facebookPageId: '',
      facebookPageAdress: '',
    };

    try {
      const settings = await this.userSettingsModel
        .findOneAndUpdate(
          { tenant_id },
          { $setOnInsert: defaultSettings },
          { new: true, upsert: true },
        )
        .exec();
      return settings!;
    } catch (err: any) {
      if (err.code === 11000) {
        return (await this.userSettingsModel.findOne({ tenant_id }).exec()) as UserSettings;
      }
      throw err;
    }
  }

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

    // --- LOGIKA PODMIANY PLIKÓW (USUWANIE STARYCH Z DYSKU) ---
    if (updateSettingsDto.logoFilePath && settings.logoFilePath && updateSettingsDto.logoFilePath !== settings.logoFilePath) {
      const oldPath = this.getPhysicalPath(settings.logoFilePath);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    if (updateSettingsDto.separatorFilePath && settings.separatorFilePath && updateSettingsDto.separatorFilePath !== settings.separatorFilePath) {
      const oldPath = this.getPhysicalPath(settings.separatorFilePath);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // Twoje oryginalne przypisania
    settings.language = updateSettingsDto.language ?? settings.language;
    settings.country = updateSettingsDto.country ?? settings.country;
    settings.name = updateSettingsDto.name ?? settings.name;
    settings.selectedRadioStream = updateSettingsDto.selectedRadioStream ?? settings.selectedRadioStream;
    settings.footerVisibilityRules = updateSettingsDto.footerVisibilityRules ?? settings.footerVisibilityRules;
    settings.pictureSlideDuration = updateSettingsDto.pictureSlideDuration ?? settings.pictureSlideDuration;
    settings.country = country || settings.country;
    settings.logoFileName = updateSettingsDto.logoFileName ?? settings.logoFileName;
    settings.logoFilePath = updateSettingsDto.logoFilePath ?? settings.logoFilePath;
    settings.logoFileType = updateSettingsDto.logoFileType ?? settings.logoFileType;
    settings.separatorFileName = updateSettingsDto.separatorFileName ?? settings.separatorFileName;
    settings.separatorFilePath = updateSettingsDto.separatorFilePath ?? settings.separatorFilePath;
    settings.separatorFileType = updateSettingsDto.separatorFileType ?? settings.separatorFileType;
    settings.mainLogoUrl = updateSettingsDto.mainLogoUrl ?? settings.mainLogoUrl;
    settings.enableFacebookModule = updateSettingsDto.enableFacebookModule ?? settings.enableFacebookModule;
    settings.includeSharedStories = updateSettingsDto.includeSharedStories ?? settings.includeSharedStories;
    settings.selectedFacebookPage = updateSettingsDto.selectedFacebookPage ?? settings.selectedFacebookPage;
    settings.facebookPageAccess = updateSettingsDto.facebookPageAccess ?? settings.facebookPageAccess;
    settings.facebookPageId = updateSettingsDto.facebookPageId ?? settings.facebookPageId;
    settings.facebookPageAdress = updateSettingsDto.facebookPageAdress ?? settings.facebookPageAdress;

    console.log('Nowe ustawienie country:', settings.country);

    await settings.save();
    return settings;
  }

  async getAllTenants(): Promise<{ tenant_id: string; country: string }[]> {
    const tenants = await this.userSettingsModel.aggregate([
      { $group: { _id: { tenant_id: '$tenant_id', country: '$country' } } },
      { $project: { _id: 0, tenant_id: '$_id.tenant_id', country: '$_id.country' } },
    ]);
    return tenants;
  }
}