import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { Media } from './media.model';
import { CreateMediaDto } from './create-media.dto';

@Injectable()
export class MediaService {
  constructor(@InjectModel(Media.name) private mediaModel: Model<Media>) {}

  // 📌 Przesyłanie nowego pliku
  async upload(createMediaDto: CreateMediaDto): Promise<Media> {
    await this.mediaModel.updateMany(
      { tenant_id: createMediaDto.tenant_id, order: { $gte: 1 } },
      { $inc: { order: 1 } }
    );

    const newMedia = new this.mediaModel({ ...createMediaDto, order: 1 });
    return newMedia.save();
  }

  // 📌 Pobieranie listy plików
  async getAll(tenant_id: string): Promise<Media[]> {
    if (!tenant_id) {
      throw new Error('Tenant ID is required');
    }
    return this.mediaModel.find({ tenant_id }).sort({ order: 1 }).exec();
  }

  // 📌 Usuwanie pliku
  async delete(id: string, tenant_id: string): Promise<Media[]> {
    const media = await this.mediaModel.findOne({ _id: id, tenant_id });
    if (!media) {
      throw new NotFoundException('Plik nie znaleziony');
    }

    const baseUploadPath =
    process.env.NODE_ENV === 'production'
      ? path.join(__dirname, '..', '..', '..', 'public_html', 'uploads', 'media', tenant_id)
      : path.join(__dirname, '..', '..', 'uploads', 'media', tenant_id);

  const filePath = path.join(baseUploadPath, path.basename(media.filePath));

  try {
    await fs.promises.access(filePath, fs.constants.F_OK); // Sprawdzenie istnienia
    await fs.promises.unlink(filePath); // Usunięcie pliku
  } catch (err) {
    console.warn('⚠️ Plik nie istnieje lub nie można go usunąć:', filePath);
  }

    // Usuwamy media
    await this.mediaModel.findByIdAndDelete(id);

    // Przesuwamy pozostałe media o jeden w dół
    await this.mediaModel.updateMany(
      { tenant_id, order: { $gt: media.order } }, // Wybieramy media z wyższym orderem
      { $inc: { order: -1 } } // Zmniejszamy order o 1
    );

    // Pobieramy zaktualizowaną listę mediów
    return this.mediaModel.find({ tenant_id }).sort({ order: 1 }).exec();
  }

  // 📌 Przesuwanie pliku w górę
  async moveUp(id: string, tenant_id: string): Promise<void> {
    const media = await this.mediaModel.findOne({ _id: id, tenant_id });
    if (!media) throw new NotFoundException('Media nie znalezione');

    const previous = await this.mediaModel.findOne({ tenant_id, order: media.order - 1 });
    if (!previous) throw new NotFoundException('Media są już na najwyższej pozycji');

    await this.mediaModel.bulkWrite([
      { updateOne: { filter: { _id: media._id }, update: { order: media.order - 1 } } },
      { updateOne: { filter: { _id: previous._id }, update: { order: previous.order + 1 } } },
    ]);
  }

  // 📌 Przesuwanie pliku w dół
  async moveDown(id: string, tenant_id: string): Promise<void> {
    const media = await this.mediaModel.findOne({ _id: id, tenant_id });
    if (!media) throw new NotFoundException('Media nie znalezione');

    const next = await this.mediaModel.findOne({ tenant_id, order: media.order + 1 });
    if (!next) throw new NotFoundException('Media są już na najniższej pozycji');

    await this.mediaModel.bulkWrite([
      { updateOne: { filter: { _id: media._id }, update: { order: media.order + 1 } } },
      { updateOne: { filter: { _id: next._id }, update: { order: next.order - 1 } } },
    ]);
  }

  // 📌 Aktualizacja kolejności `order`
  private async updateOrders(tenant_id: string) {
    const allMedia = await this.mediaModel.find({ tenant_id }).sort({ order: 1 });
    const updates = allMedia.map((media, index) => ({
      updateOne: { filter: { _id: media._id }, update: { order: index + 1 } },
    }));

    await this.mediaModel.bulkWrite(updates);
  }
}
