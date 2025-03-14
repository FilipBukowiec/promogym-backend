import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { join } from 'path';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Konfiguracja CORS
  app.enableCors({
    origin: 'http://localhost:4200', 
    methods: 'GET, POST, PUT, DELETE', 
    allowedHeaders: 'Content-Type, Authorization, tenant-id, country'
  });

  app.use('/uploads', express.static(join(__dirname, '..', 'public_html', 'uploads')));
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
