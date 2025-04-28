import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NewsService } from './news.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:4200', 'https://app.promogym.pl'],
    methods: ['GET', 'POST'],
  },
  path: '/backend/socket.io', 
})
export class NewsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly newsService: NewsService) {}

  @SubscribeMessage('joinTenant')
  handleJoin(
    @MessageBody() tenant_id: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (typeof tenant_id !== 'string') {
      console.warn(`❌ joinTenant: Oczekiwano stringa, otrzymano:`, tenant_id);
      return;
    }

    client.join(tenant_id);
    console.log(`✅ Klient dołączył do pokoju: ${tenant_id}`);
  }

  @SubscribeMessage('leaveTenant')
  handleLeave(
    @MessageBody() tenant_id: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (typeof tenant_id !== 'string') {
      console.warn(`❌ leaveTenant: Oczekiwano stringa, otrzymano:`, tenant_id);
      return;
    }

    client.leave(tenant_id);
    console.log(`👋 Klient opuścił pokój: ${tenant_id}`);
  }

  @SubscribeMessage('newsLiveUpdate')
  handleLiveUpdate(@MessageBody() tenant_id: string) {
    if (typeof tenant_id !== 'string') {
      console.warn(`❌ newsLiveUpdate: Oczekiwano stringa, otrzymano:`, tenant_id);
      return;
    }

    console.log(`📡 Otrzymano zapytanie o liveUpdate dla tenant_id: ${tenant_id}`);
    this.server.to(tenant_id).emit('newsUpdate', 'Zaktualizuj newsy!');
    console.log(`📤 Wysłano powiadomienie do pokoju ${tenant_id}`);
  }
}
