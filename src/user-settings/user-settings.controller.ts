import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Headers,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Param,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
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



 // 📌 Upload LOGO lub SEPARATORA
@UseGuards(AuthGuard('jwt'))
@Post('upload/:type') // :type = 'mainlogo' lub 'separator'
@UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const tenantId = req.headers['tenant-id'] as string;
      if (!tenantId) return cb(new Error('Tenant ID is required'), '');

      const uploadPath = path.join(
        __dirname,
        '..',
        '..',
        'public_html',
        'uploads',
        'logos',
        tenantId
      );

      if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const type = req.params.type;
      const ext = path.extname(file.originalname).toLowerCase();

      if (type !== 'mainlogo' && type !== 'separator') {
        return cb(new Error('Invalid type (must be mainlogo or separator)'), '');
      }

      if (!['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(ext)) {
        return cb(new Error('Unsupported file type'), '');
      }

      cb(null, `${type}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
}))


async uploadAsset(
  @UploadedFile() file: Express.Multer.File,
  @Headers('tenant-id') tenant_id: string,
  @Param('type') type: 'mainlogo' | 'separator',
) {
  const updateDto: UpdateUserSettingsDto = {};

  if (type === 'mainlogo') {
    updateDto.logoFileName = file.filename;
    updateDto.logoFilePath = `uploads/logos/${tenant_id}/${file.filename}`;
    updateDto.logoFileType = file.mimetype;
  } else if (type === 'separator') {
    updateDto.separatorFileName = file.filename;
    updateDto.separatorFilePath = `uploads/logos/${tenant_id}/${file.filename}`;
    updateDto.separatorFileType = file.mimetype;
  }

  return this.settingsService.updateSettingsForTenant(tenant_id, '', updateDto);
}



@UseGuards(AuthGuard('jwt'))
@Delete('logo/:type')
async deleteLogo(
  @Headers('tenant-id') tenant_id: string,
  @Param('type') type: 'mainlogo' | 'separator',
) {
  if (!tenant_id) throw new Error('Tenant ID is required');
  if (!['mainlogo', 'separator'].includes(type)) {
    throw new Error('Invalid type (must be mainlogo or separator)');
  }

  // Ścieżka do katalogu tenanta
  const logoDir = path.join(
    __dirname,
    '..',
    '..',
    'public_html',
    'uploads',
    'logos',
    tenant_id
  );

  if (!fs.existsSync(logoDir)) {
    return { message: 'Directory does not exist, nothing to delete.' };
  }

  // Sprawdzenie, czy plik istnieje
  const files = fs.readdirSync(logoDir);
  const matchedFile = files.find((file) =>
    file.startsWith(type + '.') && /\.(png|jpe?g|webp|svg)$/.test(file)
  );

  if (matchedFile) {
    const fullPath = path.join(logoDir, matchedFile);
    try {
      fs.unlinkSync(fullPath); // Usuwanie pliku
      console.log(`Usunięto plik: ${fullPath}`);
    } catch (err) {
      console.error('Błąd podczas usuwania pliku:', err);
      return { message: 'Error deleting file.' };
    }
  } else {
    return { message: 'No matching file found to delete.' };
  }

  // Wyczyść dane w bazie danych (jeśli potrzeba)
  const updateDto: UpdateUserSettingsDto = {};
  if (type === 'mainlogo') {
    updateDto.logoFileName = '';
    updateDto.logoFilePath = '';
    updateDto.logoFileType = '';
  } else {
    updateDto.separatorFileName = '';
    updateDto.separatorFilePath = '';
    updateDto.separatorFileType = '';
  }

  try {
    await this.settingsService.updateSettingsForTenant(tenant_id, '', updateDto);
  } catch (err) {
    console.error('Błąd podczas aktualizacji danych w bazie:', err);
    return { message: 'Error updating database.' };
  }

  return { message: 'Logo deleted successfully' };
}
}