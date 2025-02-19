import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Media, MediaSchema } from './media.model';
import { MediaService } from './media.service';

@Module({
  imports: [MongooseModule.forFeature([{name: Media.name, schema:MediaSchema }])],
  controllers: [MediaController],
  providers: [MediaService]
})
export class MediaModule {}
