import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { News } from './news.model';
import { CreateNewsDto } from './create-news.dto';

@Injectable()
export class NewsService {
  constructor(@InjectModel(News.name) private newsModel: Model<News>) {}

  // Tworzenie nowego newsa
  async create(createNewsDto: CreateNewsDto, tenant_id: string): Promise<News> {
    // Inkrementujemy order dla wszystkich istniejących newsów (wszystkich, które mają order >= 1)
    await this.newsModel.updateMany(
      { tenant_id, order: { $gte: 1 } },  // Zwiększamy order dla newsów o order >= 1
      { $inc: { order: 1 } }  // Zwiększamy order o 1
    );
  
    // Tworzymy nowego newsa z order 1
    const createdNews = new this.newsModel({
      ...createNewsDto,
      tenant_id,
      order: 1,  // Nowy news zawsze ma order 1
    });
  
    // Zapisujemy nowego newsa
    return createdNews.save();
  }
  
  // Pobieranie newsów dla danego tenant_id
  async findByTenant(tenant_id: string): Promise<News[]> {
    return this.newsModel.find({ tenant_id }).sort({ order: 1 }).lean();
  }

  // Edytowanie treści newsa
  async updateNews(id: string, content: string, tenant_id: string): Promise<News> {
    const updatedNews = await this.newsModel.findOneAndUpdate(
      { _id: id, tenant_id },
      { content },
      { new: true }
    );
    if (!updatedNews) {
      throw new NotFoundException('News not found');
    }
    return updatedNews;
  }

  // Usuwanie newsa i aktualizacja kolejności
  async deleteNews(id: string, tenant_id: string): Promise<void> {
    const deletedNews = await this.newsModel.findOneAndDelete({ _id: id, tenant_id });
    if (!deletedNews) {
      throw new NotFoundException('News not found');
    }

    // Przesuwamy newsy w górę po usunięciu
    await this.newsModel.updateMany(
      { tenant_id, order: { $gt: deletedNews.order } },
      { $inc: { order: -1 } }
    );
  }

  // Przesuwanie newsa w górę
  async moveUp(id: string, tenant_id: string): Promise<void> {
    const session = await this.newsModel.db.startSession();
    session.startTransaction();

    try {
      const currentNews = await this.newsModel.findOne({ _id: id, tenant_id }).session(session);
      if (!currentNews) throw new NotFoundException('News not found');

      const aboveNews = await this.newsModel.findOne({
        tenant_id,
        order: currentNews.order - 1
      }).session(session);
      if (!aboveNews) throw new Error('Already at the top');

      // Zamieniamy ordery
      await this.newsModel.updateOne({ _id: currentNews._id }, { order: currentNews.order - 1 }).session(session);
      await this.newsModel.updateOne({ _id: aboveNews._id }, { order: aboveNews.order + 1 }).session(session);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Przesuwanie newsa w dół
  async moveDown(id: string, tenant_id: string): Promise<void> {
    const session = await this.newsModel.db.startSession();
    session.startTransaction();

    try {
      const currentNews = await this.newsModel.findOne({ _id: id, tenant_id }).session(session);
      if (!currentNews) throw new NotFoundException('News not found');

      const belowNews = await this.newsModel.findOne({
        tenant_id,
        order: currentNews.order + 1
      }).session(session);
      if (!belowNews) throw new Error('Already at the bottom');

      // Zamieniamy ordery
      await this.newsModel.updateOne({ _id: currentNews._id }, { order: currentNews.order + 1 }).session(session);
      await this.newsModel.updateOne({ _id: belowNews._id }, { order: belowNews.order - 1 }).session(session);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
