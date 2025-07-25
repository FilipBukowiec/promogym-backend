import {
  Controller,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Get,
  UploadedFile,
  UseInterceptors,
  NotFoundException,
  BadRequestException,
  Headers,
  UseGuards
} from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { CreateAnnouncementDto } from './create-announcement.dto';
import { UpdateAnnouncementDto } from './update-announcement.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import { AuthGuard } from '@nestjs/passport';

const BASE_UPLOADS_PATH =
  process.env.NODE_ENV === 'production'
    ? path.join(__dirname, '..', '..', '..', 'public_html', 'uploads', 'announcements')
    : path.join(__dirname, '..', '..', 'public_html', 'uploads', 'announcements');

const audioFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestException('Unsupported audio file type'), false);
  }
};

@Controller('announcements')
@UseGuards(AuthGuard('jwt'))
export class AnnouncementController {

  constructor(private readonly announcementService: AnnouncementService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const tenantId = req.headers['tenant-id'] as string;
        if (!tenantId) return cb(new BadRequestException('Tenant ID is required'), '');
        const uploadPath = path.join(BASE_UPLOADS_PATH, tenantId);

        try {
          fsSync.mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        } catch (err) {
          cb(err, '');
        }
      },
      filename: (req, file, cb) => {
        const filename = `${uuidv4()}-${file.originalname}`;
        cb(null, filename);
      },
    }),
    fileFilter: audioFileFilter,
  }))
  async create(
    @Body() createDto: CreateAnnouncementDto,
    @Headers('tenant-id') tenant_id: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!tenant_id) throw new BadRequestException('Tenant ID is required');
    if (!file) throw new BadRequestException('File is required');

    if (createDto.scheduleType === 'cyclic') {
      createDto.selectedDays = typeof createDto.selectedDays === 'string' ? JSON.parse(createDto.selectedDays) : createDto.selectedDays;
      createDto.selectedHours = typeof createDto.selectedHours === 'string' ? JSON.parse(createDto.selectedHours) : createDto.selectedHours;
      createDto.selectedMinutes = typeof createDto.selectedMinutes === 'string' ? JSON.parse(createDto.selectedMinutes) : createDto.selectedMinutes;
    }

    const announcementData = {
      ...createDto,
      fileName: file.filename,
      filePath: `uploads/announcements/${tenant_id}/${file.filename}`,
      fileType: file.mimetype,
      tenant_id,
    };

    const newAnnouncement = await this.announcementService.create(announcementData, tenant_id);

    return newAnnouncement;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAnnouncementDto,
    @Headers('tenant-id') tenant_id: string,
  ) {
    if (!tenant_id) throw new BadRequestException('Tenant ID is required');

    if (updateDto.scheduleType === 'cyclic') {
      updateDto.selectedDays = typeof updateDto.selectedDays === 'string' ? JSON.parse(updateDto.selectedDays) : updateDto.selectedDays;
      updateDto.selectedHours = typeof updateDto.selectedHours === 'string' ? JSON.parse(updateDto.selectedHours) : updateDto.selectedHours;
      updateDto.selectedMinutes = typeof updateDto.selectedMinutes === 'string' ? JSON.parse(updateDto.selectedMinutes) : updateDto.selectedMinutes;
    }

    const updatedAnnouncement = await this.announcementService.update(id, updateDto, tenant_id);

    return updatedAnnouncement;
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Headers('tenant-id') tenant_id: string) {
    if (!tenant_id) throw new BadRequestException('Tenant ID is required');

    const announcement = await this.announcementService.findById(id, tenant_id);
    if (!announcement) throw new NotFoundException('Ogłoszenie nie znalezione');

    if (announcement.fileName) {
      const filePath = path.join(BASE_UPLOADS_PATH, tenant_id, announcement.fileName);

      try {
        await fs.access(filePath);
        await fs.unlink(filePath);
      } catch {
      }
    }

    await this.announcementService.delete(id, tenant_id);

    return { message: 'Ogłoszenie usunięte' };
  }

  @Get()
  async getAll(@Headers('tenant-id') tenant_id: string) {
    if (!tenant_id) throw new BadRequestException('Tenant ID jest wymagane');

    return this.announcementService.getAll(tenant_id);
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @Headers('tenant-id') tenant_id: string) {
    if (!tenant_id) throw new BadRequestException('Tenant ID jest wymagane');

    return this.announcementService.getOne(id, tenant_id);
  }
}
