import { Module } from '@nestjs/common';
import { SentencesController } from './sentences.controller';
import { SentencesService } from './sentences.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Sentence, SentenceSchema } from './sentence.model';

@Module({
  imports: [MongooseModule.forFeature([{name: Sentence.name, schema: SentenceSchema}])],
  controllers: [SentencesController],
  providers: [SentencesService],
})
export class SentencesModule {}
