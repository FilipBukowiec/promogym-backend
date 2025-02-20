import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { News, NewsSchema } from './news.model'; // Import modelu
import { NewsGateway } from './news.gateway';

@Module({
  imports: [MongooseModule.forFeature([{ name: News.name, schema: NewsSchema }])],
  providers: [NewsService, NewsGateway],
  controllers: [NewsController],
})
export class NewsModule {}
