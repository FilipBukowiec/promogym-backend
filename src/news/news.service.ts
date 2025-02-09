import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { News, NewsDocument } from './news.schema';
import { Model } from 'mongoose';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  constructor(
    @InjectModel(News.name) private newsModel: Model<NewsDocument>,
  ) {}

  // async getAllNews(): Promise<News[]> {
  //   this.logger.debug('Fetching all news...');
  //   try {
  //     const news = await this.newsModel.find().exec(); // Pobranie danych
  //     this.logger.log('Successfully fetched all news');
  //     return news; // Zwrócenie pobranych danych
  //   } catch (error) {
  //     this.logger.error('Error while fetching news:', error.stack);
  //     throw error; // Rzucenie błędu, jeśli coś poszło nie tak
  //   }
  // }
   
  async getAllNews(): Promise<News[]> {
    try {
      return await this.newsModel.find().exec();
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;  // Rzucenie błędu, jeśli coś poszło nie tak
    }
  }


  
  async createNews(content: string, order: number ): Promise<News> {
    try {
      const newNews = new this.newsModel({ content, order, });
      return await newNews.save();
    } catch (error) {
      console.error('Error creating news:', error);
      throw new Error('Unable to create news');
    }
  }
}
