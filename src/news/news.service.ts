// src/news/news.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { News } from './news.schema';

@Injectable()
export class NewsService {
  constructor(@InjectModel(News.name) private newsModel: Model<News>) {}

  // Tworzenie nowej wiadomości
  async createNews(order: number, content: string, tenantId: string): Promise<News> {
    const newNews = new this.newsModel({ order, content, tenantId });
    return newNews.save();
  }

  // Pobieranie wiadomości powiązanej z tenantId
  async findByTenantId(tenantId: string): Promise<News[]> {
    return this.newsModel.find({ tenantId }).exec();
  }



  
  // Pobieranie wszystkich wiadomości
  async findAll(): Promise<News[]> {
    return this.newsModel.find().exec();
  }
}
