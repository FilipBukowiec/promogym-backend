import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Advertisement } from './advertisement.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateAdvertisementDto } from './create-advertisement.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AdvertisementsService {
  constructor(
    @InjectModel(Advertisement.name)
    private advertisementModel: Model<Advertisement>,
  ) {}

  async upload(createAdvertisementDto: CreateAdvertisementDto): Promise<Advertisement> {
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

  async getAll(): Promise<Advertisement[]> {
        return this.advertisementModel.find().sort({ order: 1 }).exec();
    
  }



  async getByCountry(country: string): Promise<Advertisement[]> {
    return this.advertisementModel
      .find({ countries: country })
      .sort({ order: 1 })
      .exec();
  }

  async update(id: string, updateData: Partial<{ countries: string[] }>): Promise<void> {
    console.log('🛠 UPDATE: próbuję zaktualizować:', id, updateData);
  
    if (updateData.countries) {
      // Sortowanie tablicy krajów
      updateData.countries = [...updateData.countries].sort();
    }
  
    try {
      // Przeprowadzamy aktualizację w bazie danych
      const updatedAdvertisement = await this.advertisementModel.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true } // Ustalamy, aby zwrócić nowy obiekt po aktualizacji
      );
  
      // Sprawdzamy, czy aktualizacja się udała
      if (!updatedAdvertisement) {
        throw new Error('Nie znaleziono reklamy do aktualizacji');
      }
  
      console.log('✅ Reklama została zaktualizowana:', updatedAdvertisement);
    } catch (error) {
      console.error('❌ Błąd podczas aktualizacji reklamy:', error);
      throw error; // Rzucamy błąd dalej, żeby kontroler mógł odpowiedzieć
    }
  }
  

  async delete(id: string): Promise<Advertisement[]> {
    const ad = await this.advertisementModel.findById(id);
    if (!ad) throw new NotFoundException('Ogłoszenie nie znalezione');

    const uploadsDir = process.env.NODE_ENV === 'production'
    ? path.join(__dirname, '..', '..', 'public_html', 'uploads', 'advertisements')
    : path.join(__dirname, '..', '..', 'uploads', 'advertisements');
  
  const filePath = path.join(uploadsDir, path.basename(ad.filePath));
  
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (err) {
    console.error('Błąd przy usuwaniu pliku:', err);
  }
  

    await this.advertisementModel.findByIdAndDelete(id);

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

  private async updateOrders() {
    const allAds = await this.advertisementModel.find().sort({ order: 1 });
    const updates = allAds.map((ad, index) => ({
      updateOne: { filter: { _id: ad._id }, update: { order: index + 1 } },
    }));

    await this.advertisementModel.bulkWrite(updates);
  }
}
