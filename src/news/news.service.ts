import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { News, NewsDocument } from './news.schema';
import { Model } from 'mongoose';

type Direction = 'up' | 'down';

@Injectable()
export class NewsService {
  constructor(@InjectModel(News.name) private newsModel: Model<NewsDocument>) {}

  async createNews(
    content: string,
    order: number,
    tenantId: string,
  ): Promise<News> {
    const createdNews = new this.newsModel({ content, order, tenantId });
    return createdNews.save();
  }

  async getNewsByTenant(tenantId: string, user: any): Promise<News[]> {
    if (user.roles.includes('admin')) {
      return this.newsModel.find().sort({ order: 1 }).exec();
    }

    return this.newsModel.find({ tenantId }).sort({ order: 1 }).exec();
  }

  async deleteNews(
    id: string,
    tenantId: string,
    user: any,
  ): Promise<News | null> {
    if (user.roles.includes('admin')) {
      return this.newsModel.findByIdAndDelete(id).exec();
    }
    return this.newsModel.findOneAndDelete({ _id: id, tenantId }).exec();
  }

  async updateNews(
    id: string,
    tenantId: string,
    updatedData: Partial<News>,
    user: any,
  ): Promise<News | null> {
    if (user.roles.includes('admin')) {
      return this.newsModel
        .findByIdAndUpdate(id, updatedData, { new: true })
        .exec();
    }
    return this.newsModel
      .findOneAndUpdate({ _id: id, tenantId }, updatedData, { new: true })
      .exec();
  }

  async moveNews(id: string, direction: Direction, user: any): Promise<any> {
    const newsToMove = await this.newsModel.findById(id);
    if (!newsToMove) {
      throw new Error('News not found');
    }

    const tenantId = user.tenantId;

    if (newsToMove.tenantId !== tenantId && !user.roles.includes('admin')) {
      throw new Error('Unauthorized action');
    }

    let relatedNews;

    if (direction === 'up') {
      // Finding the previous news (one step up in order)
      relatedNews = await this.newsModel.findOne({
        order: newsToMove.order - 1,
      });
      if (!relatedNews) {
        throw new Error('Cannot move up, already at top position');
      }
    } else if (direction === 'down') {
      // Finding the next news (one step down in order)
      relatedNews = await this.newsModel.findOne({
        order: newsToMove.order + 1,
      });
      if (!relatedNews) {
        throw new Error('Cannot move down, already at bottom position');
      }
    }

    // Now, perform the move by updating both the `newsToMove` and `relatedNews` orders
    await this.newsModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: newsToMove._id },
          update: { order: newsToMove.order + (direction === 'up' ? -1 : 1) },
        },
      },
      {
        updateOne: {
          filter: { _id: relatedNews._id },
          update: { order: relatedNews.order - (direction === 'up' ? -1 : 1) },
        },
      },
    ]);

    return { message: `News moved ${direction} successfully` };
  }
}
