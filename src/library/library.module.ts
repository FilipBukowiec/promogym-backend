import { Module } from '@nestjs/common';
import { LibraryController } from './library.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Library, LibrarySchema } from './library.model';
import { LibraryService } from './library.service';
import { LibraryGateway } from './library.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Library.name, schema: LibrarySchema }]),
  ],
  controllers: [LibraryController],
  providers: [LibraryService, LibraryGateway],
})
export class LibraryModule {}
