import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as cron from 'node-cron';
import { Announcement } from './announcement.model';
import { CreateAnnouncementDto } from './create-announcement.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AnnouncementService {
    private scheduledTasks: Record<string, cron.ScheduledTask> = {};

    constructor(@InjectModel(Announcement.name) private announcementModel: Model<Announcement>) {}

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

    async update(id: string, updateDto: Partial<CreateAnnouncementDto>, tenant_id: string, fileName?: string): Promise<Announcement> {
        const announcement = await this.announcementModel.findOne({ _id: id, tenant_id });
        if (!announcement) {
            throw new NotFoundException('Ogłoszenie nie znalezione');
        }

        if (fileName) {
            if (announcement.fileName) {
                const oldFilePath = path.join(__dirname, '..', '..', 'public', 'uploads', 'announcements', announcement.fileName);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
            announcement.fileName = fileName;
        }

        Object.assign(announcement, updateDto);
        
        return announcement.save();
    }

    async delete(id: string, tenant_id: string): Promise<void> {
        const announcement = await this.announcementModel.findOne({ _id: id, tenant_id });
        if (!announcement) {
            throw new NotFoundException('Ogłoszenie nie znalezione');
        }

        if (announcement.fileName) {
            const filePath = path.join(__dirname, '..', '..', 'public', 'uploads', 'announcements', announcement.fileName);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await this.announcementModel.deleteOne({ _id: id, tenant_id });
    }

    async getAll(tenant_id: string): Promise<Announcement[]> {
        return this.announcementModel.find({ tenant_id });
    }
}
