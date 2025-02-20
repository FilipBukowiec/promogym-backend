import { 
    Controller, Get, Post, Delete, Put, Body, Param, UseGuards, Headers, UseInterceptors, UploadedFile 
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { diskStorage } from 'multer';
  import * as fs from 'fs';
  import * as path from 'path';
  import { AnnouncementService } from './announcement.service';
  import { CreateAnnouncementDto } from './create-announcement.dto';
  import { AuthGuard } from '@nestjs/passport';
  import { Announcement } from './announcement.model';
  
  @Controller('announcements')
  export class AnnouncementController {
    constructor(private readonly announcementService: AnnouncementService) {}
  
    // Konfiguracja Multer
    private static multerOptions = {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const tenantId = req.headers['tenant-id'] as string;
          if (!tenantId) {
            return cb(new Error('Tenant ID is required'), path.join(__dirname));
          }
  
          const uploadPath = path.join(__dirname, "..", "..", "public_html", "uploads", "announcements", tenantId);
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
  
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const fileName = Date.now() + path.extname(file.originalname);
          cb(null, fileName);
        },
      }),
    };
  
    // Tworzenie ogłoszenia z przesyłaniem pliku
    @UseGuards(AuthGuard('jwt'))
    @Post()
    @UseInterceptors(FileInterceptor('file', AnnouncementController.multerOptions))
    async create(
      @Body() createAnnouncementDto: CreateAnnouncementDto, 
      @Headers('tenant-id') tenant_id: string,
      @UploadedFile() file?: Express.Multer.File
    ): Promise<Announcement> {
      if (!tenant_id) {
        throw new Error('Tenant ID is required');
      }
      
      const fileName = file ? file.filename : undefined;
      return this.announcementService.create(createAnnouncementDto, tenant_id, fileName);
    }
  
    // Aktualizacja ogłoszenia (możliwość przesyłania nowego pliku)
    @UseGuards(AuthGuard('jwt'))
    @Put(':id')
    @UseInterceptors(FileInterceptor('file', AnnouncementController.multerOptions))
    async update(
      @Param('id') id: string, 
      @Body() updateDto: Partial<CreateAnnouncementDto>, 
      @Headers('tenant-id') tenant_id: string,
      @UploadedFile() file?: Express.Multer.File
    ): Promise<Announcement> {
      if (!tenant_id) {
        throw new Error('Tenant ID is required');
      }
  
      const fileName = file ? file.filename : undefined;
      return this.announcementService.update(id, updateDto, tenant_id, fileName);
    }
  
    // Usunięcie ogłoszenia
    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    async delete(@Param('id') id: string, @Headers('tenant-id') tenant_id: string): Promise<void> {
      if (!tenant_id) {
        throw new Error('Tenant ID is required');
      }
      return this.announcementService.delete(id, tenant_id);
    }
  
    // Pobranie wszystkich ogłoszeń dla danego najemcy
    @Get()
    async findAll(@Headers('tenant-id') tenant_id: string): Promise<Announcement[]> {
      if (!tenant_id) {
        throw new Error('Tenant ID is required');
      }
      return this.announcementService.getAll(tenant_id);
    }
  }
  