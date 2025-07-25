import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,

} from '@nestjs/websockets';
import { Server} from 'socket.io';
import { BaseGateway } from 'src/common/gateways/base.gateway';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:4200', 'https://app.promogym.pl'],
    methods: ['GET', 'POST'],
  },
  path: '/backend/socket.io',
})
export class MediaGateway extends BaseGateway {
  @WebSocketServer()
  server: Server;



  @SubscribeMessage('mediaLiveUpdate')
  handleLiveUpdate(@MessageBody() tenant_id: string) {
    console.log(`📡 Otrzymano zapytanie o liveUpdate dla tenant_id: ${tenant_id}`);
    this.server.to(tenant_id).emit('mediaUpdate', 'Zaktualizuj media!');
    console.log(`📤 Wysłano powiadomienie do pokoju ${tenant_id}`);
  }
}
