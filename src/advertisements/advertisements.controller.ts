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
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { AdvertisementsService } from './advertisements.service';
import { AuthGuard } from '@nestjs/passport'; // JWT Guard
import { CreateAdvertisementDto } from './create-advertisement.dto';

@Controller('advertisement')
export class AdvertisementsController {
  constructor(private readonly advertisementsService: AdvertisementsService) {}

  // 📌 Przesyłanie plików (JWT Guard)
  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {

          const baseUploadPath = process.env.NODE_ENV === "production"
          ? path.join(
            __dirname,
            '..',
            '..',
            'public_html',
            'uploads',
            'advertisements',
          )
          :path.join(__dirname, '..', '..', 'uploads', 'advertisements');
  
          // Tworzenie folderu, jeśli nie istnieje
          if (!fs.existsSync(baseUploadPath)) {
            fs.mkdirSync(baseUploadPath, { recursive: true });
          }
   
          cb(null, baseUploadPath);
        },
        filename: (req, file, cb) => {
          // Generujemy unikalną nazwę pliku, aby uniknąć kolizji
          const uniqueName = `${Date.now()}-${file.originalname}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateAdvertisementDto,
  ) {
    console.log('Otrzymane dane z frontendu (body):', body);
  
    // Parsujemy countries, jeśli przyszło jako string JSON
    let parsedCountries: string[] = [];
  
    if (body.countries) {
      if (typeof body.countries === 'string') {
        try {
          parsedCountries = JSON.parse(body.countries);
          if (!Array.isArray(parsedCountries)) {
            throw new Error('Countries is not a valid array');
          }
        } catch (error) {
          console.error('Błąd parsowania countries:', error);
          throw new Error('Invalid countries format');
        }
      } else {
        parsedCountries = body.countries;
      }
    }
  
    console.log('Sparsowane countries:', parsedCountries);
  
    // Tworzymy DTO do wysłania do serwisu
    const createAdvertisementDto: CreateAdvertisementDto = {
      fileName: file.filename,
      filePath: `uploads/advertisements/${file.filename}`,
      fileType: file.mimetype,
      countries: parsedCountries, // Przekazujemy już prawidłową tablicę
    };
  
    console.log('Tworzone DTO dla reklamy:', createAdvertisementDto);
  
    return this.advertisementsService.upload(createAdvertisementDto);
  }
  
  @Get()
  async getAll() {
    return this.advertisementsService.getAll();
  }

  @Get(':country')
  async getAllForCountry(@Param('country') country: string) {
    return this.advertisementsService.getByCountry(country);
  }

  // 📌 Usuwanie ogłoszenia (JWT Guard)
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') id: string) {
    await this.advertisementsService.delete(id);
    return { message: 'Advertisement deleted successfully' };
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async updateAdvertisement(
    @Param('id') id: string,
    @Body() updateData: Partial<{ countries: string[] }>
  ) {
    await this.advertisementsService.update(id, updateData);
    return { message: 'Advertisement updated successfully' };
  }

  // 📌 Przesunięcie ogłoszenia w górę (JWT Guard)
  @Put('move-up/:id')
  @UseGuards(AuthGuard('jwt'))
  async moveUp(@Param('id') id: string) {
    await this.advertisementsService.moveUp(id);
    return { message: 'Advertisement moved up successfully' };
  }

  // 📌 Przesunięcie ogłoszenia w dół (JWT Guard)
  @Put('move-down/:id')
  @UseGuards(AuthGuard('jwt'))
  async moveDown(@Param('id') id: string) {
    await this.advertisementsService.moveDown(id);
    return { message: 'Advertisement moved down successfully' };
  }
}
