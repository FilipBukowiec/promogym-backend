import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FacebookService } from './facebook.service';
import { FacebookController } from './facebook.controller';

@Module({
    imports: [HttpModule],
    providers: [FacebookService],
    controllers: [FacebookController],
    exports: [FacebookService],
})
export class FacebookModule { }
