import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MediaService } from './media.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:4200', // Adres Twojej aplikacji frontendowej (Angular)
    methods: ['GET', 'POST'], // Dozwolone metody HTTP
  },
})
export class MediaGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly mediaService: MediaService) {}

  
  // Klient dołącza do pokoju danego tenant_id
  @SubscribeMessage('joinTenant')
  handleJoin(
    @MessageBody() tenant_id: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(tenant_id);
    console.log(`Klient dołączył do pokoju: ${tenant_id}`);
  }

  // Klient wysyła żądanie live update i serwer wysyła powiadomienie do wszystkich klientów w danym pokoju
  @SubscribeMessage('mediaLiveUpdate')
  handleLiveUpdate(@MessageBody() tenant_id: string) {
    console.log(`Otrzymano zapytanie o liveUpdate dla tenant_id: ${tenant_id}`);
    this.server.to(tenant_id).emit('mediaUpdate', 'Zaktualizuj media!');
    console.log(`Wysłano powiadomienie do pokoju ${tenant_id}`);
  }

  @SubscribeMessage('leaveTenant')
  handleLeave(
    @MessageBody() tenant_id: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(tenant_id);
    console.log(`Klient opuścił pokój ${tenant_id}`);
  }
}
