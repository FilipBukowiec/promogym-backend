import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { join } from 'path';
import { IoAdapter } from '@nestjs/platform-socket.io';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Konfiguracja CORS dla HTTP
  app.enableCors({
    origin: 'http://localhost:4200', // Dopuszczamy dostęp z frontendowej aplikacji
    methods: 'GET, POST, PUT, DELETE, PATCH', // Dodajemy wszystkie metody, które będą używane
    allowedHeaders: 'Content-Type, Authorization, tenant-id, country', // Dodajemy wszystkie nagłówki, które są wymagane
    // preflightContinue: false, // Domyślnie false, co oznacza, że preflight odpowiedź nie jest przekazywana do kolejnego middleware
    // optionsSuccessStatus: 204, // Ustalamy odpowiedni status dla preflight, aby zadziałały metody OPTIONS
  });

  // Middleware do obsługi preflight request dla OPTIONS
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, tenant-id, country');
      return res.sendStatus(204); // Odpowiada na preflight OPTIONS z 204
    }
    next();
  });

  // Ustawienie WebSocket Adaptera z obsługą CORS
  const ioAdapter = new IoAdapter(app);
  app.useWebSocketAdapter(ioAdapter);

  app.use('/uploads', express.static(join(__dirname, '..', 'public_html', 'uploads')));

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
