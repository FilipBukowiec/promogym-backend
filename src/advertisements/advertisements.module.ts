import { Module } from '@nestjs/common';
import { AdvertisementsService } from './advertisements.service';
import { AdvertisementsController } from './advertisements.controller';
import mongoose from 'mongoose';
import { Advertisement, AdvertisementSchema } from './advertisement.model';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Advertisement.name, schema: AdvertisementSchema },
    ]),
  ],

  providers: [AdvertisementsService],
  controllers: [AdvertisementsController],
})
export class AdvertisementModule { }
