import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Announcement } from './announcement.model';
import { CreateAnnouncementDto } from './create-announcement.dto';
import * as fs from 'fs/promises';
import * as path from 'path';

export const BASE_UPLOADS_PATH =
    process.env.NODE_ENV === 'production'
        ? path.join(__dirname, '..', '..', '..', 'public_html', 'uploads', 'announcements')
        : path.join(__dirname, '..', '..', 'public_html', 'uploads', 'announcements');


@Injectable()
export class AnnouncementService {
    constructor(@InjectModel(Announcement.name) private announcementModel: Model<Announcement>) { }

    async findById(id: string, tenant_id: string): Promise<Announcement | null> {
        const announcement = await this.announcementModel.findOne({ _id: id, tenant_id }).exec();
        if (!announcement) {
            throw new NotFoundException('Ogłoszenie nie znalezione');
        }
        return announcement;
    }

    async create(createAnnouncementDto: CreateAnnouncementDto, tenant_id: string,): Promise<Announcement> {
        const {
            fileName,
            filePath,
            fileType,
            description,
            scheduleType,
            selectedDays,
            selectedHours,
            selectedMinutes,
            scheduledTime,
            
        } = createAnnouncementDto;

        const newAnnouncement = new this.announcementModel({
            fileName,
            filePath,
            fileType,
            description,
            scheduleType,
            tenant_id,
            selectedDays: scheduleType === 'cyclic' ? selectedDays ?? [] : [],
            selectedHours: scheduleType === 'cyclic' ? selectedHours ?? [] : [],
            selectedMinutes: scheduleType === 'cyclic' ? selectedMinutes ?? [] : [],
            scheduledTime: scheduleType === 'oneTime' && scheduledTime ? new Date(scheduledTime) : null,
        });

        await newAnnouncement.save();
        return newAnnouncement;
    }

    async update(id: string, updateDto: Partial<CreateAnnouncementDto>, tenant_id: string): Promise<Announcement> {
        const announcement = await this.announcementModel.findOne({ _id: id, tenant_id });
        if (!announcement) {
            throw new NotFoundException('Ogłoszenie nie znalezione');
        }
      

        const {
            // fileName: _fileName,
            filePath: _filePath,
            fileType: _fileType,
            tenant_id: _tenantId,
            ...safeUpdateDto
        } = updateDto;

        Object.assign(announcement, safeUpdateDto);




        if (updateDto.scheduleType === 'oneTime') {
            announcement.selectedDays = [];
            announcement.selectedHours = [];
            announcement.selectedMinutes = [];
        }

        return announcement.save();
    }



    // Usuwanie ogłoszenia
    async delete(id: string, tenant_id: string): Promise<void> {
        const announcement = await this.announcementModel.findOne({ _id: id, tenant_id });
        if (!announcement) {
            throw new NotFoundException('Ogłoszenie nie znalezione');
        }

        // Usuwanie pliku, jeśli istnieje
        if (announcement.fileName) {
            const filePath = path.join(BASE_UPLOADS_PATH, tenant_id, announcement.fileName);
            try {
                await fs.access(filePath);  // sprawdzamy, czy plik istnieje
                await fs.unlink(filePath);  // usuwamy plik asynchronicznie
            } catch (error) {
                // jeśli plik nie istnieje lub błąd podczas usuwania, ignorujemy
            }
        }

        // Usuwanie ogłoszenia z bazy
        await this.announcementModel.deleteOne({ _id: id, tenant_id });
    }

    // Pobieranie wszystkich ogłoszeń dla danego tenant_id
    async getAll(tenant_id: string): Promise<Announcement[]> {
        return this.announcementModel.find({ tenant_id }).exec();
    }

    // Pobieranie jednego ogłoszenia po ID i tenant_id
    async getOne(id: string, tenant_id: string): Promise<Announcement> {
        const announcement = await this.announcementModel.findOne({ _id: id, tenant_id });
        if (!announcement) {
            throw new NotFoundException('Ogłoszenie nie znalezione');
        }
        return announcement;
    }
}
