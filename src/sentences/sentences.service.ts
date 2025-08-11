import { Injectable } from '@nestjs/common';
import { Sentence } from './sentence.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class SentencesService {
constructor(@InjectModel(Sentence.name) private sentenceModel: Model<Sentence>)
{}
async findAllSentences(): Promise<Sentence[]>{
return this.sentenceModel.find().sort({order:1}).lean();
}

}
