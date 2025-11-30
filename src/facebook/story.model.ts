// NestJS: story.model.ts (lub podobnie nazwany plik)

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Eksportujemy typ dokumentu dla łatwiejszego użycia w repozytorium
export type StoryDocument = Story & Document;

@Schema()
export class Story {
    // Odpowiada story.post_id z API
    @Prop({ required: true, unique: true })
    postId: string; 

    // Odpowiada story.status z API
    @Prop({ required: true })
    status: string;

    // Odpowiada story.media_type z API
    @Prop({ required: true })
    mediaType: string;

    // Pole przechowujące URL do obrazu lub wideo
    @Prop({ required: true })
    mediaUrl: string;

    // Odpowiada story.url z API (jeśli jest potrzebny link do Story)
    @Prop({ required: false })
    storyUrl: string;
}

export const StorySchema = SchemaFactory.createForClass(Story);