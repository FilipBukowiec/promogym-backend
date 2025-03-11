import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Advertisement } from './advertisement.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateAdvertisementDto } from './create-advertiesment.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AdvertisementService {
  constructor(
    @InjectModel(Advertisement.name)
    private advertisementModel: Model<Advertisement>,
  ) {}

  async upload(
    createAdvertisementDto: CreateAdvertisementDto,
  ): Promise<Advertisement> {
    await this.advertisementModel.updateMany(
      { order: { $gte: 1 } },
      { $inc: { order: 1 } },
    );
    const newAdvertisement = new this.advertisementModel({
      ...createAdvertisementDto,
      order: 1,
    });
    return newAdvertisement.save();
  }

  async getAll(language?:string): Promise<Advertisement[]> {

    if(language){
    return this.advertisementModel.find({languages:language}).sort({ order: 1 }).exec();
     } else{
        return this.advertisementModel.find().sort({order:1}).exec();
     } }

  async getByLanguage(language: string): Promise<Advertisement[]> {
    return this.advertisementModel
      .find({ languages: language })
      .sort({ order: 1 })
      .exec();
  }

  async delete(id: string): Promise<Advertisement[]> {
    const ad = await this.advertisementModel.findById(id);
    if (!ad) throw new NotFoundException('Ogłosznie nie znalezione');

    const filePath = path.join(
      __dirname,
      '..',
      '..',
      'publi_html',
      ad.filePath,
    );

    try {
      await fs.promises.unlink(filePath);
    } catch (err) {
      throw new InternalServerErrorException('Nie udało się usunąć pliku');
    }
    await this.advertisementModel.findByIdAndUpdate(id);

    await this.advertisementModel.updateMany(
      { order: { $gt: ad.order } },
      { $inc: { order: -1 } },
    );
    return this.advertisementModel.find().sort({ order: 1 }).exec();
  }

  
  async moveUp(id: string): Promise<void> {
    const ad = await this.advertisementModel.findById(id);
    if (!ad) throw new NotFoundException('Ogłoszenie nie znalezione');

    const previous = await this.advertisementModel.findOne({ order: ad.order - 1 });
    if (!previous) throw new NotFoundException('Ogłoszenie jest już na najwyższej pozycji');

    await this.advertisementModel.bulkWrite([
      { updateOne: { filter: { _id: ad._id }, update: { order: ad.order - 1 } } },
      { updateOne: { filter: { _id: previous._id }, update: { order: previous.order + 1 } } },
    ]);
  }

  // 📌 Przesuwanie ogłoszenia w dół
  async moveDown(id: string): Promise<void> {
    const ad = await this.advertisementModel.findById(id);
    if (!ad) throw new NotFoundException('Ogłoszenie nie znalezione');

    const next = await this.advertisementModel.findOne({ order: ad.order + 1 });
    if (!next) throw new NotFoundException('Ogłoszenie jest już na najniższej pozycji');

    await this.advertisementModel.bulkWrite([
      { updateOne: { filter: { _id: ad._id }, update: { order: ad.order + 1 } } },
      { updateOne: { filter: { _id: next._id }, update: { order: next.order - 1 } } },
    ]);
  }

  // 📌 Aktualizacja kolejności `order`
  private async updateOrders() {
    const allAds = await this.advertisementModel.find().sort({ order: 1 });
    const updates = allAds.map((ad, index) => ({
      updateOne: { filter: { _id: ad._id }, update: { order: index + 1 } },
    }));

    await this.advertisementModel.bulkWrite(updates);
  }


}
