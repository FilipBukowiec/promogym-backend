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
      secret: process.env.AUTH0_CLIENT_SECRET, // Lub użyj publicznego klucza Auth0
      signOptions: { expiresIn: '1h' },  // Token ważny przez 1 godzinę
    }),
    NewsModule,
    AuthModule,
    UserModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
