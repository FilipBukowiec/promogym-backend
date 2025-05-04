import {
  Controller,
  Post,
  Delete,
  Get,
  Put,
  Param,
  UseInterceptors,
  UploadedFile,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { MediaService } from './media.service';
import { CreateMediaDto } from './create-media.dto';
import { AuthGuard } from '@nestjs/passport'; // JWT Guard

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  // 📌 Przesyłanie plików (JWT Guard)
  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        // Sprawdzanie tenant-id tylko w tym miejscu, a nie w metodzie uploadFile
        const tenantId = req.headers['tenant-id'] as string;

        if (!tenantId) {
          // Przekazanie dwóch argumentów do cb: error i pusty string jako destination
          return cb(new Error('Tenant ID is required'), '');
        }

        const baseUploadPath =
        process.env.NODE_ENV === 'production'
          ? path.join(__dirname, '..', '..', '..', 'public_html', 'uploads', 'media', tenantId)
          : path.join(__dirname, '..', '..', 'uploads', 'media', tenantId);

      if (!fs.existsSync(baseUploadPath)) {
        fs.mkdirSync(baseUploadPath, { recursive: true });
      }

      cb(null, baseUploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
}),
)
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Headers('tenant-id') tenant_id: string) {
    // Teraz nie musimy sprawdzać tenant-id, bo zostało to już zrobione w destination
    const createMediaDto: CreateMediaDto = {
      fileName: file.filename,
      filePath: `uploads/media/${tenant_id}/${file.filename}`,
      fileType: file.mimetype,
      tenant_id,
    };

    return this.mediaService.upload(createMediaDto);
  }

  // 📌 Pobieranie listy plików (Publiczny, bez JWT)
  @Get()
  async getAll(@Headers('tenant-id') tenant_id: string) {
    if (!tenant_id) {
      throw new Error('Tenant ID is required');
    }
    return this.mediaService.getAll(tenant_id);
  }

  // 📌 Usuwanie pliku (JWT Guard)
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') id: string, @Headers('tenant-id') tenant_id: string) {
    if (!tenant_id) {
      throw new Error('Tenant ID is required');
    }
    await this.mediaService.delete(id, tenant_id);
    return { message: 'Media usunięte pomyślnie' };
  }

  // 📌 Przesunięcie pliku w górę (JWT Guard)
  @Put('move-up/:id')
  @UseGuards(AuthGuard('jwt'))
  async moveUp(@Param('id') id: string, @Headers('tenant-id') tenant_id: string) {
    if (!tenant_id) {
      throw new Error('Tenant ID is required');
    }
    await this.mediaService.moveUp(id, tenant_id);
    return { message: 'Media przesunięte w górę pomyślnie' };
  }

  // 📌 Przesunięcie pliku w dół (JWT Guard)
  @Put('move-down/:id')
  @UseGuards(AuthGuard('jwt'))
  async moveDown(@Param('id') id: string, @Headers('tenant-id') tenant_id: string) {
    if (!tenant_id) {
      throw new Error('Tenant ID is required');
    }
    await this.mediaService.moveDown(id, tenant_id);
    return { message: 'Media przesunięte w dół pomyślnie' };
  }
}
