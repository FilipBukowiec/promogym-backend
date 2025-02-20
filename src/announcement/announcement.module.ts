import { Module } from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { AnnouncementController } from './announcement.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Announcement, AnnouncementSchema } from './announcement.model';

@Module({
  imports: [MongooseModule.forFeature([{name:Announcement.name, schema:AnnouncementSchema }])],
  providers: [AnnouncementService],
  controllers: [AnnouncementController]
})
export class AnnouncementModule {}
