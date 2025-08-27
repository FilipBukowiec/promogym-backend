import { IsNumber, IsString } from "class-validator";


export class CreateSentenceDto {
    @IsString()
    content: string;

    @IsNumber()
    order: number;
}
