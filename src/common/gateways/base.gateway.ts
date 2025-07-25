import { ConnectedSocket, MessageBody, SubscribeMessage } from '@nestjs/websockets';
import { Socket } from 'socket.io';

export abstract class BaseGateway {
  @SubscribeMessage('joinTenant')
  handleJoin(@MessageBody() tenant_id: string, @ConnectedSocket() client: Socket) {
    if (typeof tenant_id !== 'string') {
      console.warn(`❌ joinTenant: oczekiwano stringa, otrzymano:`, tenant_id);
      return;
    }

    client.join(tenant_id);
    console.log(`✅ Klient dołączył do pokoju: ${tenant_id}`);
  }

  @SubscribeMessage('leaveTenant')
  handleLeave(@MessageBody() tenant_id: string, @ConnectedSocket() client: Socket) {
    if (typeof tenant_id !== 'string') {
      console.warn(`❌ leaveTenant: oczekiwano stringa, otrzymano:`, tenant_id);
      return;
    }

    client.leave(tenant_id);
    console.log(`👋 Klient opuścił pokój: ${tenant_id}`);
  }
}
