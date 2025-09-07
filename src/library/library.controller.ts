import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // JWT Guard
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import * as path from 'path';
import { CreateLibraryDto } from './create-library.dto';
import { Library } from './library.model';
import { LibraryService } from './library.service';
import { PutTenantLibraryRequest } from './interfaces/library.interface';

@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  // 📌 Przesyłanie plików (JWT Guard)
  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
      storage: diskStorage({
        destination: (req, file, cb) => {
          const baseUploadPath =
            process.env.NODE_ENV === 'production'
              ? path.join(
                  __dirname,
                  '..',
                  '..',
                  '..',
                  'public_html',
                  'uploads',
                  'library',
                )
              : path.join(
                  __dirname,
                  '..',
                  '..',
                  'public_html',
                  'uploads',
                  'library',
                );

          if (!fs.existsSync(baseUploadPath)) {
            fs.mkdirSync(baseUploadPath, { recursive: true });
          }

          cb(null, baseUploadPath);
        },
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    // Teraz nie musimy sprawdzać tenant-id, bo zostało to już zrobione w destination
    const createLibraryDto: CreateLibraryDto = {
      fileName: file.filename,
      filePath: `uploads/library/${file.filename}`,
      fileType: file.mimetype,
    };

    return this.libraryService.upload(createLibraryDto);
  }

  // 📌 Pobieranie listy plików (Publiczny, bez JWT)
  @Get()
  async getAll() {
    return this.libraryService.getAll();
  }

  // 📌 Usuwanie pliku (JWT Guard)
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') id: string) {
    await this.libraryService.delete(id);
    return { message: 'Library usunięte pomyślnie' };
  }

  // 📌 Przesunięcie pliku w górę (JWT Guard)
  @Put('move-up/:id')
  @UseGuards(AuthGuard('jwt'))
  async moveUp(@Param('id') id: string) {
    await this.libraryService.moveUp(id);
    return { message: 'Library przesunięte w górę pomyślnie' };
  }

  // 📌 Przesunięcie pliku w dół (JWT Guard)
  @Put('move-down/:id')
  @UseGuards(AuthGuard('jwt'))
  async moveDown(@Param('id') id: string) {
    await this.libraryService.moveDown(id);
    return { message: 'Library przesunięte w dół pomyślnie' };
  }

  @Put('tenant/add')
  public async addTenant(
    @Body() body: PutTenantLibraryRequest,
  ): Promise<void | null> {
    return this.libraryService.addTenant(body.tenantId, body.id);
  }

  @Put('tenant/remove')
  public async removeTenant(
    @Body() body: PutTenantLibraryRequest,
  ): Promise<void | null> {
    return this.libraryService.removeTenant(body.tenantId, body.id);
  }

  @Get('tenant/list/:tenantId')
  public async listTenant(
    @Param('tenantId') tenantId: string,
  ): Promise<Library[]> {
    return this.libraryService.listTenant(tenantId);
  }
}
