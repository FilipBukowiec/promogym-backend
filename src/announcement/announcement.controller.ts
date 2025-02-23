import { Controller, Post, Body, Param, Put, Delete, Get, UploadedFile, UseInterceptors, NotFoundException, BadRequestException, Headers, UseGuards } from '@nestjs/common'; // Dodano UseGuards
import { AnnouncementService } from './announcement.service';
import { CreateAnnouncementDto } from './create-announcement.dto';
import { UpdateAnnouncementDto } from './update-announcement.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { AuthGuard } from '@nestjs/passport'; // Upewnij się, że masz ten import
import * as cron from 'node-cron';

// Ustalona lokalizacja plików (katalog główny)
const BASE_UPLOADS_PATH = path.join(__dirname, '..', '..', 'public_html', 'uploads', 'announcements');

@Controller('announcements')
@UseGuards(AuthGuard('jwt')) // Autoryzacja na poziomie całego kontrolera
export class AnnouncementController {
    private scheduledTasks: Record<string, cron.ScheduledTask> = {};

    constructor(private readonly announcementService: AnnouncementService) {}

    // Tworzenie ogłoszenia
    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                // Ścieżka do katalogu z plikami na podstawie tenant_id
                const tenantId = req.headers['tenant-id'] as string;
                if (!tenantId) {
                    return cb(new BadRequestException('Tenant ID is required'), ''); // Zmieniono null na ''
                }
                
                const uploadPath = path.join(BASE_UPLOADS_PATH, tenantId);
                // Tworzymy katalog, jeśli nie istnieje
                fs.mkdirSync(uploadPath, { recursive: true });
 
                cb(null, uploadPath); // Użycie dynamicznej ścieżki
            },
            filename: (req, file, cb) => {
                const filename = uuidv4() + '-' + file.originalname;
                cb(null, filename);
            },
        }),
    }))
    async create(
        @Body() createAnnouncementDto: CreateAnnouncementDto,
        @Headers('tenant-id') tenant_id: string, 
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (!tenant_id) throw new BadRequestException('Tenant ID is required');

        const fileName = file ? file.filename : undefined;
        const newAnnouncement = await this.announcementService.create(createAnnouncementDto, tenant_id, fileName);

        // Obsługa harmonogramu (cron) dla cyklicznych ogłoszeń
        if (createAnnouncementDto.scheduleType === 'cyclic') {
            this.handleCronSchedule(newAnnouncement, createAnnouncementDto);
        }

        return newAnnouncement;
    }

    // Aktualizacja ogłoszenia
    @Put(':id')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                // Ścieżka do katalogu z plikami na podstawie tenant_id
                const tenantId = req.headers['tenant-id'] as string;
                if (!tenantId) {
                    return cb(new Error('Tenant ID is required'), ''); // Zmieniono null na ''
                }
                
                const uploadPath = path.join(BASE_UPLOADS_PATH, tenantId);
                // Tworzymy katalog, jeśli nie istnieje
                fs.mkdirSync(uploadPath, { recursive: true });

                cb(null, uploadPath); // Użycie dynamicznej ścieżki
            },
            filename: (req, file, cb) => {
                const filename = uuidv4() + '-' + file.originalname;
                cb(null, filename);
            },
        }),
    }))
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateAnnouncementDto,
        @Headers('tenant-id') tenant_id: string, 
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (!tenant_id) throw new BadRequestException('Tenant ID is required');

        const fileName = file ? file.filename : undefined;
        const updatedAnnouncement = await this.announcementService.update(id, updateDto, tenant_id, fileName);

        // Obsługa harmonogramu (cron) dla cyklicznych ogłoszeń
        if (updateDto.scheduleType === 'cyclic') {
            this.handleCronSchedule(updatedAnnouncement, updateDto);
        }

        return updatedAnnouncement;
    }

    // Usuwanie ogłoszenia
    @Delete(':id')
    async delete(@Param('id') id: string, @Headers('tenant-id') tenant_id: string) {
        if (!tenant_id) throw new BadRequestException('Tenant ID is required');

        const announcement = await this.announcementService.findById(id, tenant_id);
        if (!announcement) throw new NotFoundException('Ogłoszenie nie znalezione');

        // Usunięcie zaplanowanego zadania cron
        this.removeScheduledTask(id);

        // Asynchroniczne usuwanie pliku (jeśli istnieje)
        if (announcement.fileName) {
            const filePath = path.join(BASE_UPLOADS_PATH, tenant_id, announcement.fileName); // Użycie tenant_id w ścieżce
            fs.access(filePath, fs.constants.F_OK, (err) => {
                if (!err) {
                    fs.unlink(filePath, (unlinkErr) => {
                        if (unlinkErr) console.error('Błąd usuwania pliku:', unlinkErr);
                    });
                }
            });
        }

        await this.announcementService.delete(id, tenant_id);
    }

    // Pobieranie wszystkich ogłoszeń dla danego tenant_id
    @Get()
    async getAll(@Headers('tenant-id') tenant_id: string) {
        if (!tenant_id) throw new BadRequestException('Tenant ID is required');

        const announcements = await this.announcementService.getAll(tenant_id);
        if (!announcements.length) throw new NotFoundException('Brak ogłoszeń dla tego tenant-a');

        return announcements;
    }

    // Pobieranie pojedynczego ogłoszenia
    @Get(':id')
    async getOne(@Param('id') id: string, @Headers('tenant-id') tenant_id: string) {
        if (!tenant_id) throw new BadRequestException('Tenant ID is required');

        return await this.announcementService.getOne(id, tenant_id);
    }

    // Obsługa harmonogramu (cron) dla cyklicznych ogłoszeń
    private handleCronSchedule(announcement, scheduleDto) {
        const cronExpression = this.generateCronExpression(
            scheduleDto.scheduleOption,
            scheduleDto.selectedDays,
            scheduleDto.selectedHours,
            scheduleDto.selectedMinutes
        );

        if (cronExpression) {
            this.removeScheduledTask(announcement._id as string); // Usunięcie starego zadania
            announcement.cronSchedule = cronExpression;
            announcement.save();

            try {
                this.scheduledTasks[announcement._id] = cron.schedule(cronExpression, () => {
                    console.log(`Cykliczne ogłoszenie uruchomione: ${announcement.description}`);
                });
            } catch (error) {
                console.error('Błąd planowania zadania cron:', error);
            }
        }
    }

    // Generowanie wyrażenia cron
    private generateCronExpression(scheduleOption, selectedDays, selectedHours, selectedMinutes) {
        const days = selectedDays.length ? selectedDays.join(',') : '*';
        const hours = selectedHours.length ? selectedHours.join(',') : '*';
        const minutes = selectedMinutes.length ? selectedMinutes.join(',') : '*';

        if (scheduleOption === 'everyDay') return `${minutes} ${hours} * * *`;
        if (scheduleOption === 'specificDay') return `${minutes} ${hours} * * ${days}`;

        return null;
    }

    // Usuwanie zaplanowanego zadania
    private removeScheduledTask(announcementId: string) {
        if (this.scheduledTasks[announcementId]) {
            this.scheduledTasks[announcementId].destroy();
            delete this.scheduledTasks[announcementId];
            console.log('Zadanie zostało usunięte z harmonogramu');
        }
    }
}
