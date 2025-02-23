import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Announcement } from './announcement.model';
import { CreateAnnouncementDto } from './create-announcement.dto';
import * as fs from 'fs';
import * as path from 'path';

// Ustalona lokalizacja plików (katalog główny) w public_html
const BASE_UPLOADS_PATH = path.join(__dirname, '..', '..', 'public_html', 'uploads', 'announcements');

@Injectable()
export class AnnouncementService {
    constructor(@InjectModel(Announcement.name) private announcementModel: Model<Announcement>) {}

    async findById(id: string, tenant_id: string): Promise<Announcement | null> {
        const announcement = await this.announcementModel.findOne({ _id: id, tenant_id }).exec();
        if (!announcement) {
            throw new NotFoundException('Ogłoszenie nie znalezione');
        }
        return announcement;
    }
    
    // Tworzenie ogłoszenia
    async create(createAnnouncementDto: CreateAnnouncementDto, tenant_id: string, fileName?: string): Promise<Announcement> {
        const { description, scheduleType, scheduleOption, selectedDays, selectedHours, selectedMinutes, scheduledTime } = createAnnouncementDto;

        const newAnnouncement = new this.announcementModel({
            fileName,
            description,
            scheduleType,
            tenant_id,
            scheduleOption: scheduleType === 'cyclic' ? scheduleOption ?? '' : undefined,
            selectedDays: scheduleType === 'cyclic' ? selectedDays ?? [] : [],
            selectedHours: scheduleType === 'cyclic' ? selectedHours ?? [] : [],
            selectedMinutes: scheduleType === 'cyclic' ? selectedMinutes ?? [] : [],
            scheduledTime: scheduleType === 'oneTime' && scheduledTime ? new Date(scheduledTime) : null,
        });

        await newAnnouncement.save();
        return newAnnouncement;
    }

    // Aktualizacja ogłoszenia
    async update(id: string, updateDto: Partial<CreateAnnouncementDto>, tenant_id: string, fileName?: string): Promise<Announcement> {
        const announcement = await this.announcementModel.findOne({ _id: id, tenant_id });
        if (!announcement) {
            throw new NotFoundException('Ogłoszenie nie znalezione');
        }

        // Jeśli jest nowy plik, usuwamy stary i zapisujemy nowy
        if (fileName) {
            if (announcement.fileName) {
                const oldFilePath = path.join(BASE_UPLOADS_PATH, tenant_id, announcement.fileName);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
            announcement.fileName = fileName;
        }

        // Aktualizowanie innych danych
        Object.assign(announcement, updateDto);
        
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
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Usuwanie ogłoszenia z bazy
        await this.announcementModel.deleteOne({ _id: id, tenant_id });
    }

    // Pobieranie wszystkich ogłoszeń dla danego tenant_id
    async getAll(tenant_id: string): Promise<Announcement[]> {
        return this.announcementModel.find({ tenant_id });
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
