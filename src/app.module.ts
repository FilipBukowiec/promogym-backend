import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NewsModule } from './news/news.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MediaModule } from './media/media.module';
import { AnnouncementModule } from './announcement/announcement.module';
import { SettingsModule } from './user-settings/user-settings.module';
import { AdvertisementModule } from './advertisements/advertisements.module';
import { AdminSettingsModule } from './admin-settings/admin-settings.module';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
