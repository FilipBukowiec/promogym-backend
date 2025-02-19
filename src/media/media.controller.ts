import { Controller, Post, Delete, Get, Put, Param, UseInterceptors, UploadedFile, Headers, UseGuards } from '@nestjs/common';
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
        const tenantId = req.headers['tenant-id'] as string;
        if (!tenantId) {
          return cb(new Error('Tenant ID is required'), path.join(__dirname));
        }

        const uploadPath = path.join(__dirname, "..", "..", "public_html", "uploads", "media", tenantId);
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        cb(null, file.originalname);
      },
    }),
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Headers('tenant-id') tenant_id: string) {
    if (!tenant_id) {
      throw new Error('Tenant ID is required');
    }

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
  async getAll() {
    return this.mediaService.getAll();
  }

  // 📌 Usuwanie pliku (JWT Guard)
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') id: string) {
    await this.mediaService.delete(id);
    return { message: 'Media usunięte pomyślnie' };
  }

  // 📌 Przesunięcie pliku w górę (JWT Guard)
  @Put('move-up/:id')
  @UseGuards(AuthGuard('jwt'))
  async moveUp(@Param('id') id: string) {
    await this.mediaService.moveUp(id);
    return { message: 'Media przesunięte w górę pomyślnie' };
  }

  // 📌 Przesunięcie pliku w dół (JWT Guard)
  @Put('move-down/:id')
  @UseGuards(AuthGuard('jwt'))
  async moveDown(@Param('id') id: string) {
    await this.mediaService.moveDown(id);
    return { message: 'Media przesunięte w dół pomyślnie' };
  }
}
