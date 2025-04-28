import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { join } from 'path';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplicationContext } from '@nestjs/common';
import { ServerOptions } from 'socket.io';

dotenv.config();

class CustomIoAdapter extends IoAdapter {
  constructor(app: INestApplicationContext, private readonly isProduction: boolean) {
    super(app);
  }

  createIOServer(port: number, options?: any): any {
    const serverOptions = {
      ...options,
      path: this.isProduction ? '/backend/socket.io' : '/socket.io',
    };
    return super.createIOServer(port, serverOptions);
  }
}



async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isProduction = process.env.NODE_ENV === 'production';
  const prefix = isProduction ? 'backend' : '';

  if (prefix) {
    app.setGlobalPrefix(prefix);
  }

  // Użycie naszego adaptera
  const ioAdapter = new CustomIoAdapter(app, isProduction);
  app.useWebSocketAdapter(ioAdapter);

  const frontendUrl = process.env.FRONTEND_URL;

  app.enableCors({
    origin: frontendUrl,
    methods: 'GET, POST, PUT, DELETE, PATCH',
    allowedHeaders: 'Content-Type, Authorization, tenant-id, country',
  });

  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', frontendUrl);
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, tenant-id, country');
      return res.sendStatus(204);
    }
    next();
  });

  app.use('/uploads', express.static(join(__dirname, '..', 'public_html', 'uploads')));

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
