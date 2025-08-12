import { Injectable } from '@nestjs/common';
import { Sentence } from './sentence.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSentenceDto } from './create-sentence.dto';

@Injectable()
export class SentencesService {
  constructor(
    @InjectModel(Sentence.name) private sentenceModel: Model<Sentence>,
  ) {}

  async createOne(createSentenceDto: CreateSentenceDto): Promise<Sentence> {
    await this.sentenceModel.updateMany(
      { order: { $gte: 1 } },
      { $inc: { order: 1 } },
    );
    const createSentence = new this.sentenceModel({
      ...createSentenceDto,
      order: 1,
    });
    return createSentence.save();
  }

  async createMany(sentencesDto: CreateSentenceDto[]): Promise<Sentence[]> {
    if (sentencesDto.length === 0) {
      throw new Error('the list is empty');
    }
    await this.sentenceModel.updateMany(
      { order: { $gte: 1 } },
      { $inc: { order: sentencesDto.length } },
    );
    const sentencesToInsert = sentencesDto.map((dto, index) => ({
      ...dto,
      order: index + 1,
    }));
    return this.sentenceModel.insertMany(sentencesToInsert);
  }

  async getAllSentences(): Promise<Sentence[]> {
    return this.sentenceModel.find().sort({ order: 1 }).lean();
  }

  async getSentenceOfTheDay(): Promise<Sentence> {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    const totalSentences = await this.sentenceModel.countDocuments();

    if (totalSentences === 0) {
      throw new Error('The db is empty');
    }
    const sentenceNumber = ((dayOfYear - 1) % totalSentences) + 1;

    const sentence =
      (await this.sentenceModel.findOne({ order: sentenceNumber }).lean()) ??
      (await this.sentenceModel
        .findOne()
        .skip(Math.floor(Math.random() * totalSentences))
        .lean());

    if (!sentence) {
      throw new Error('Nie udało się pobrać żadnej sentencji');
    }
    return sentence;
  }

  async deleteById(sentenceId: string): Promise<void> {
    const sentence = await this.sentenceModel.findById(sentenceId);
    if (!sentence) {
      throw new Error('sentencja nie znaleziona');
    }

    const orderToMove = sentence.order;

    await this.sentenceModel.deleteOne({ _id: sentenceId });

    await this.sentenceModel.updateMany(
      { order: { $gt: orderToMove } },
      { $inc: { order: -1 } },
    );
  }

  async deleteAllSentences(): Promise<void> {
    const session = await this.sentenceModel.db.startSession();
    session.startTransaction();

    try {
      await this.sentenceModel.deleteMany({}).session(session);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async moveUp(id: string): Promise<void> {
    const session = await this.sentenceModel.db.startSession();
    session.startTransaction();

    try {
      const currentSentence = await this.sentenceModel
        .findById(id)
        .session(session);

      if (!currentSentence) {
        throw new Error('Sentencja nie znaleziona');
      }

      if (currentSentence.order === 1) {
        throw new Error('sentencja na samej górze');
      }

      const aboveSentence = await this.sentenceModel
        .findOne({ order: currentSentence.order - 1 })
        .session(session);
      if (!aboveSentence) {
        throw new Error('Nie znaleziono elementu powyżej');
      }

      await this.sentenceModel
        .updateOne(
          { _id: currentSentence._id },
          { order: currentSentence.order - 1 },
        )
        .session(session);

      await this.sentenceModel
        .updateOne(
          { _id: aboveSentence._id },
          { order: aboveSentence.order + 1 },
        )
        .session(session);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async moveDown(id: string): Promise<void> {
    const session = await this.sentenceModel.db.startSession();
    session.startTransaction();

    try {
      const currentSentence = await this.sentenceModel
        .findById(id)
        .session(session);

      if (!currentSentence) {
        throw new Error('Sentencja nie znaleziona');
      }

      const totalSentences = await this.sentenceModel
        .countDocuments()
        .session(session);

      if (currentSentence.order === totalSentences) {
        throw new Error('sentencja już jest na dole');
      }

      const underSentence = await this.sentenceModel
        .findOne({ order: currentSentence.order + 1 })
        .session(session);
      if (!underSentence) {
        throw new Error('Nie znaleziono elementu poniżej');
      }

      await this.sentenceModel
        .updateOne(
          { _id: currentSentence._id },
          { order: currentSentence.order + 1 },
        )
        .session(session);

      await this.sentenceModel
        .updateOne(
          { _id: underSentence._id },
          { order: underSentence.order - 1 },
        )
        .session(session);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
