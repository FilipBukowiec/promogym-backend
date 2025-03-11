import {
    Controller,
    Post,
    Delete,
    Get,
    Put,
    Param,
    UseInterceptors,
    UploadedFile,
    Body,
    UseGuards,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { diskStorage } from 'multer';
  import * as fs from 'fs';
  import * as path from 'path';
  import { AdvertisementService } from './advertisement.service';
  import { AuthGuard } from '@nestjs/passport'; // JWT Guard
import { CreateAdvertisementDto } from './create-advertiesment.dto';
  
  @Controller('advertisement')
  export class AdvertisementController {
    constructor(private readonly advertisementService: AdvertisementService) {}
  
    // 📌 Przesyłanie plików (JWT Guard)
    @Post('upload')
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(__dirname, "..", "..", "public_html", "uploads", "advertisements");
  
          // Tworzenie folderu, jeśli nie istnieje
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
    async uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body: { languages: string[] }) {
      if (!body.languages || body.languages.length === 0) {
        throw new Error('At least one language is required');
      }
  
      const createAdvertisementDto: CreateAdvertisementDto = {
        fileName: file.filename,
        filePath: `uploads/advertisements/${file.filename}`,
        fileType: file.mimetype,
        languages: body.languages,
      };
  
      return this.advertisementService.upload(createAdvertisementDto);
    }
  
    // 📌 Pobieranie listy ogłoszeń dla danego języka (Publiczny, bez JWT)
    @Get(':language')
    async getAll(@Param('language') language: string) {
      return this.advertisementService.getAll(language);
    }
  
    // 📌 Usuwanie ogłoszenia (JWT Guard)
    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    async delete(@Param('id') id: string) {
      await this.advertisementService.delete(id);
      return { message: 'Advertisement deleted successfully' };
    }
  
    // 📌 Przesunięcie ogłoszenia w górę (JWT Guard)
    @Put('move-up/:id')
    @UseGuards(AuthGuard('jwt'))
    async moveUp(@Param('id') id: string) {
      await this.advertisementService.moveUp(id);
      return { message: 'Advertisement moved up successfully' };
    }
  
    // 📌 Przesunięcie ogłoszenia w dół (JWT Guard)
    @Put('move-down/:id')
    @UseGuards(AuthGuard('jwt'))
    async moveDown(@Param('id') id: string) {
      await this.advertisementService.moveDown(id);
      return { message: 'Advertisement moved down successfully' };
    }
  }
  