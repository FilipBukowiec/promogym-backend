import { Controller, Get, Post, UseGuards, Body, Delete, Param, Put } from '@nestjs/common';
import { SentencesService } from './sentences.service';
import { AuthGuard } from '@nestjs/passport';
import { Sentence } from './sentence.model';
import { CreateSentenceDto } from './create-sentence.dto';

@Controller('sentences')
@UseGuards(AuthGuard('jwt'))

export class SentencesController {
  constructor(private readonly sentencesServices: SentencesService) {}

@Get()
async findAll():Promise<Sentence[]>{
return this.sentencesServices.getAllSentences();
}

@Get('daily')
async getSentenceOfTheDay():Promise<Sentence>{
  return this.sentencesServices.getSentenceOfTheDay();
}

@Post('bulk')
async createMany(@Body() createSentenceDtos:CreateSentenceDto[]):Promise<Sentence[]>{
  return this.sentencesServices.createMany(createSentenceDtos);
}

@Post('single')
async createOne(@Body() createSentenceDto: CreateSentenceDto):Promise<Sentence>{
  return this.sentencesServices.createOne(createSentenceDto);
}

@Delete('bulk')
async deleteMany():Promise<void>{
  return this.sentencesServices.deleteAllSentences();
}

@Delete(':id')
async deleteOne(@Param('id') id: string):Promise<void>{
  return this.sentencesServices.deleteById(id);
}

@Put(':id/move-up')
async moveUp(@Param('id') id: string):Promise<void>{
  return this.sentencesServices.moveUp(id);
}

@Put(':id/move-down')
async moveDown(@Param('id') id: string):Promise<void>{
  return this.sentencesServices.moveDown(id);
}

}
