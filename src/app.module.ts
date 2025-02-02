import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { ProfileController } from './profile/profile.controller';
import { NewsModule } from './news/news.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,  // Umożliwia globalny dostęp do zmiennych środowiskowych
    }),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const mongoUri = configService.get<string>('MONGODB_URI');
        if (!mongoUri) {
          throw new Error('MONGODB_URI is not defined in environment variables');
        }
        return { uri: mongoUri };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    ProfileModule,
    NewsModule,
    UserModule,
  ],
  controllers: [AppController, ProfileController],
  providers: [AppService],
})
export class AppModule {}
