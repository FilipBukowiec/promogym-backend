import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:4200', 'https://app.promogym.pl'],
    methods: ['GET', 'POST'],
  },
  path: '/backend/socket.io',
})
export class AdminSettingsGateway {
  @WebSocketServer()
  server: Server;

  constructor() {}

  @SubscribeMessage('joinGlobalRoom')
  handleJoinGlobalRoom(@ConnectedSocket() socket: Socket) {
    console.log('🌍 Otrzymano żądanie joinGlobalRoom');
    socket.join('globalRoom');
    console.log('📥 Klient dołączył do pokoju globalnego');
  }

  @SubscribeMessage('globalSettingsLiveUpdate')
  handleLiveUpdate() {
    console.log(
      '🌍 Otrzymano żądanie globalSettingsLiveUpdate – broadcast do wszystkich klientów',
    );
    this.server
      .to('globalRoom')
      .emit('globalSettingsUpdate', 'Zaktualizuj ustawienia globalne!');
  }
}
