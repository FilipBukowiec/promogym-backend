import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminSettingsModule } from './admin-settings/admin-settings.module';
import { AdvertisementModule } from './advertisements/advertisements.module';
import { AnnouncementModule } from './announcement/announcement.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ContactModule } from './contact/contact.module';
import { LibraryModule } from './library/library.module';
import { MediaModule } from './media/media.module';
import { NewsModule } from './news/news.module';
import { SentencesModule } from './sentences/sentences.module';
import { SettingsModule } from './user-settings/user-settings.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        autoIndex: true,
      }),
    }),
    JwtModule.register({
      secret: process.env.AUTH0_CLIENT_SECRET,
    }),
    NewsModule,
    AuthModule,
    UserModule,
    MediaModule,
    AnnouncementModule,
    SettingsModule,
    AdvertisementModule,
    AdminSettingsModule,
    ContactModule,
    LibraryModule,
    SentencesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
