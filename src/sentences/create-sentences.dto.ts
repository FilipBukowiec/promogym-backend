import { IsArray, ValidateNested } from 'class-validator';
import { CreateSentenceDto } from './create-sentence.dto';
import { Type } from 'class-transformer';

export class CreteSentencesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSentenceDto)
  sentences: CreateSentenceDto[];
}
