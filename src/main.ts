import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { join } from 'path';
import { IoAdapter } from '@nestjs/platform-socket.io';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Pobieranie URL frontendowego z zmiennej środowiskowej lub domyślnie localhost
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';

  // Konfiguracja CORS dla HTTP
  app.enableCors({
    origin: frontendUrl, // Dopuszczamy dostęp z frontendowej aplikacji
    methods: 'GET, POST, PUT, DELETE, PATCH', // Dodajemy wszystkie metody, które będą używane
    allowedHeaders: 'Content-Type, Authorization, tenant-id, country', // Dodajemy wszystkie nagłówki, które są wymagane
  });

  // Middleware do obsługi preflight request dla OPTIONS
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', frontendUrl);
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, tenant-id, country');
      return res.sendStatus(204); // Odpowiada na preflight OPTIONS z 204
    }
    next();
  });

  // Ustawienie WebSocket Adaptera z obsługą CORS
  const ioAdapter = new IoAdapter(app);
  app.useWebSocketAdapter(ioAdapter);

  // Serwowanie plików statycznych (np. uploadów)
  app.use('/uploads', express.static(join(__dirname, '..', 'public_html', 'uploads')));

  // Słuchanie na porcie (domyślnie 3000, ale można zmienić przez .env)
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
