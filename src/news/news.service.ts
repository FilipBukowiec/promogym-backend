import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { News, NewsDocument } from './news.schema';
import { Model } from 'mongoose';

@Injectable()
export class NewsService {
constructor(
    @InjectModel(News.name) private newsModel: Model<NewsDocument>
){}
async createNews(content: string, order: number, tenantId: string):Promise<News>{
const createdNews = new this.newsModel({content, order, tenantId});
return createdNews.save();
}

async getNewsByTenant(tenantId: string): Promise<News[]>{
    return this.newsModel.find({tenantId}).sort({order:1}).exec();
}



}
