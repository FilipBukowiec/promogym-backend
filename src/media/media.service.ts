import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Media } from './media.model';
import { CreateMediaDto } from './create-media.dto';

@Injectable()
export class MediaService {
  constructor(@InjectModel(Media.name) private mediaModel: Model<Media>) {}

  // Przesyłanie nowego pliku
  async upload(createMediaDto: CreateMediaDto): Promise<Media> {
    await this.mediaModel.updateMany(
      { tenant_id: createMediaDto.tenant_id, order: { $gte: 1 } },
      { $inc: { order: 1 } }
    );

    const newMedia = new this.mediaModel({ ...createMediaDto, order: 1 });
    return newMedia.save();
  }

  // Pobieranie mediów dla danego tenant_id
  async findByTenant(tenant_id: string): Promise<Media[]> {
    return this.mediaModel.find({ tenant_id }).sort({ order: 1 }).lean();
  }

  // Usuwanie mediów i przesuwanie kolejności
  async deleteMedia(id: string, tenant_id: string): Promise<void> {
    const mediaToDelete = await this.mediaModel.findOneAndDelete({ _id: id, tenant_id });
    if (!mediaToDelete) {
      throw new NotFoundException('Media not found');
    }

    await this.mediaModel.updateMany(
      { tenant_id, order: { $gt: mediaToDelete.order } },
      { $inc: { order: -1 } }
    );
  }

  // Przesuwanie w górę
  async moveUp(id: string, tenant_id: string): Promise<void> {
    const session = await this.mediaModel.db.startSession();
    session.startTransaction();

    try {
      const currentMedia = await this.mediaModel.findOne({ _id: id, tenant_id }).session(session);
      if (!currentMedia) throw new NotFoundException('Media not found');

      const aboveMedia = await this.mediaModel.findOne({
        tenant_id,
        order: currentMedia.order - 1
      }).session(session);
      if (!aboveMedia) throw new Error('Already at the top');

      await this.mediaModel.updateOne({ _id: currentMedia._id }, { order: currentMedia.order - 1 }).session(session);
      await this.mediaModel.updateOne({ _id: aboveMedia._id }, { order: aboveMedia.order + 1 }).session(session);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Przesuwanie w dół
  async moveDown(id: string, tenant_id: string): Promise<void> {
    const session = await this.mediaModel.db.startSession();
    session.startTransaction();

    try {
      const currentMedia = await this.mediaModel.findOne({ _id: id, tenant_id }).session(session);
      if (!currentMedia) throw new NotFoundException('Media not found');

      const belowMedia = await this.mediaModel.findOne({
        tenant_id,
        order: currentMedia.order + 1
      }).session(session);
      if (!belowMedia) throw new Error('Already at the bottom');

      await this.mediaModel.updateOne({ _id: currentMedia._id }, { order: currentMedia.order + 1 }).session(session);
      await this.mediaModel.updateOne({ _id: belowMedia._id }, { order: belowMedia.order - 1 }).session(session);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
