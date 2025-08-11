import { Controller, Get, Post, UseGuards, Headers } from '@nestjs/common';
import { SentencesService } from './sentences.service';
import { AuthGuard } from '@nestjs/passport';
import { Sentence } from './sentence.model';

@Controller('sentences')
export class SentencesController {
  constructor(private readonly sentencesServices: SentencesService) {}

@UseGuards(AuthGuard('jwt'))
@Get()
async findAll(@Headers('tenant-id') tenant_id: string):Promise<Sentence[]>{
return this.sentencesServices.getAllSentences();
}

}
