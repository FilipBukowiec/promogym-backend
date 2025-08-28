import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { Model } from 'mongoose';
import * as path from 'path';
import { CreateLibraryDto } from './create-library.dto';
import { Library } from './library.model';

@Injectable()
export class LibraryService {
  constructor(
    @InjectModel(Library.name) private libraryModel: Model<Library>,
  ) {}

  // 📌 Przesyłanie nowego pliku
  async upload(createLibraryDto: CreateLibraryDto): Promise<Library> {
    await this.libraryModel.updateMany(
      { order: { $gte: 1 } },
      { $inc: { order: 1 } },
    );

    const newLibrary = new this.libraryModel({
      ...createLibraryDto,
      order: 1,
    });
    return newLibrary.save();
  }

  // 📌 Pobieranie listy plików
  async getAll(): Promise<Library[]> {
    return this.libraryModel.find().sort({ order: 1 }).exec();
  }

  // 📌 Usuwanie pliku
  async delete(id: string): Promise<Library[]> {
    const library = await this.libraryModel.findOne({ _id: id });
    if (!library) {
      throw new NotFoundException('Plik nie znaleziony');
    }

    const baseUploadPath =
      process.env.NODE_ENV === 'production'
        ? path.join(
            __dirname,
            '..',
            '..',
            '..',
            'public_html',
            'uploads',
            'library',
          )
        : path.join(__dirname, '..', '..', 'public_html', 'uploads', 'library');

    const filePath = path.join(baseUploadPath, path.basename(library.filePath));

    try {
      await fs.promises.access(filePath, fs.constants.F_OK); // Sprawdzenie istnienia
      await fs.promises.unlink(filePath); // Usunięcie pliku
    } catch (error) {
      console.warn(
        '⚠️ Plik nie istnieje lub nie można go usunąć:',
        filePath,
        error,
      );
    }

    // Usuwamy library
    await this.libraryModel.findByIdAndDelete(id);

    // Przesuwamy pozostałe library o jeden w dół
    await this.libraryModel.updateMany(
      { order: { $gt: library.order } }, // Wybieramy library z wyższym orderem
      { $inc: { order: -1 } }, // Zmniejszamy order o 1
    );

    // Pobieramy zaktualizowaną listę mediów
    return this.libraryModel.find().sort({ order: 1 }).exec();
  }

  // 📌 Przesuwanie pliku w górę
  async moveUp(id: string): Promise<void> {
    const library = await this.libraryModel.findOne({ _id: id });
    if (!library) throw new NotFoundException('Library nie znalezione');

    const previous = await this.libraryModel.findOne({
      order: library.order - 1,
    });
    if (!previous)
      throw new NotFoundException('Library są już na najwyższej pozycji');

    await this.libraryModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: library._id },
          update: { order: library.order - 1 },
        },
      },
      {
        updateOne: {
          filter: { _id: previous._id },
          update: { order: previous.order + 1 },
        },
      },
    ]);
  }

  // 📌 Przesuwanie pliku w dół
  async moveDown(id: string): Promise<void> {
    const library = await this.libraryModel.findOne({ _id: id });
    if (!library) throw new NotFoundException('Library nie znalezione');

    const next = await this.libraryModel.findOne({
      order: library.order + 1,
    });
    if (!next)
      throw new NotFoundException('Library są już na najniższej pozycji');

    await this.libraryModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: library._id },
          update: { order: library.order + 1 },
        },
      },
      {
        updateOne: {
          filter: { _id: next._id },
          update: { order: next.order - 1 },
        },
      },
    ]);
  }

  // 📌 Aktualizacja kolejności `order`
  private async updateOrders(tenant_id: string) {
    const allLibrary = await this.libraryModel
      .find({ tenant_id })
      .sort({ order: 1 });
    const updates = allLibrary.map((library, index) => ({
      updateOne: { filter: { _id: library._id }, update: { order: index + 1 } },
    }));

    await this.libraryModel.bulkWrite(updates);
  }

  public async addTenant(tenantId: string, id: string): Promise<void | null> {
    return await this.libraryModel.findOneAndUpdate(
      { _id: id },
      { $addToSet: { tenantIds: tenantId } },
    );
  }

  public async removeTenant(
    tenantId: string,
    id: string,
  ): Promise<void | null> {
    return await this.libraryModel.findOneAndUpdate(
      { _id: id },
      { $pull: { tenantIds: tenantId } },
    );
  }

  public async listTenant(tenantId: string): Promise<Library[]> {
    console.log(tenantId);
    return await this.libraryModel.find({ tenantIds: tenantId }).exec();
  }
}
