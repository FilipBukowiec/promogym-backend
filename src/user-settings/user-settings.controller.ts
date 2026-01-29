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
export class UserSettingsController {
  constructor(private readonly settingsService: UserSettingsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getSettings(@Headers('tenant-id') tenant_id: string): Promise<UserSettings> {
    if (!tenant_id) throw new Error('Tenant ID is required');
    return this.settingsService.getSettingsForTenant(tenant_id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('tenants')
  async getAllTenants(): Promise<{ tenant_id: string; country: string }[]> {
    return this.settingsService.getAllTenants();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createDefaultSettings(
    @Headers('tenant-id') tenant_id: string,
    @Headers('country') country: string,
  ): Promise<UserSettings> {
    if (!tenant_id || !country) throw new Error('Tenant ID and Country are required');
    return this.settingsService.createDefaultSettings(tenant_id, country);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put()
  async updateSettings(
    @Body() updateSettingsDto: UpdateUserSettingsDto,
    @Headers('tenant-id') tenant_id: string,
    @Headers('country') country: string,
  ): Promise<UserSettings> {
    if (!tenant_id || !country) throw new Error('Tenant ID and Country are required');
    return this.settingsService.updateSettingsForTenant(tenant_id, country, updateSettingsDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('upload/:type')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const tenantId = req.headers['tenant-id'] as string;
          const baseUploadPath = process.env.NODE_ENV === 'production'
            ? path.join(__dirname, '..', '..', '..', 'public_html', 'uploads', 'logos')
            : path.join(__dirname, '..', '..', 'public_html', 'uploads', 'logos');

          const uploadPath = path.join(baseUploadPath, tenantId);
          if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const type = req.params.type;
          const ext = path.extname(file.originalname).toLowerCase();
          cb(null, `${Date.now()}-${type}${ext}`);
        },
      }),
    }),
  )
  async uploadAsset(
    @UploadedFile() file: Express.Multer.File,
    @Headers('tenant-id') tenant_id: string,
    @Param('type') type: 'mainlogo' | 'separator',
  ) {
    const updateDto: UpdateUserSettingsDto = {};
    const relPath = `uploads/logos/${tenant_id}/${file.filename}`;

    if (type === 'mainlogo') {
      updateDto.logoFileName = file.filename;
      updateDto.logoFilePath = relPath;
      updateDto.logoFileType = file.mimetype;
    } else {
      updateDto.separatorFileName = file.filename;
      updateDto.separatorFilePath = relPath;
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

    // Pobieramy aktualne ustawienia, żeby wiedzieć, jaką ścieżkę pliku usunąć
    const settings = await this.settingsService.getSettingsForTenant(tenant_id);
    const filePathToDelete = type === 'mainlogo' ? settings.logoFilePath : settings.separatorFilePath;

    if (filePathToDelete) {
      const baseUploadPath = process.env.NODE_ENV === 'production'
        ? path.join(__dirname, '..', '..', '..', 'public_html')
        : path.join(__dirname, '..', '..', 'public_html');
      
      const fullPath = path.join(baseUploadPath, filePathToDelete);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

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

    return this.settingsService.updateSettingsForTenant(tenant_id, '', updateDto);
  }
}