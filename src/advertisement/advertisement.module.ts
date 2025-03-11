import { Module } from '@nestjs/common';
import { AdvertisementService } from './advertisement.service';
import { AdvertisementController } from './advertisement.controller';
import mongoose from 'mongoose';
import { Advertisement, AdvertisementSchema } from './advertisement.model';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Advertisement.name, schema: AdvertisementSchema },
    ]),
  ],

  providers: [AdvertisementService],
  controllers: [AdvertisementController],
})
export class AdvertisementModule { }
