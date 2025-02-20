import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NewsService } from './news.service';

@WebSocketGateway()
@Injectable()
export class NewsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  // Przechowywanie połączeń w odniesieniu do tenant_id
  private tenantsConnections: Map<string, Set<Socket>> = new Map();

  constructor(private readonly newsService: NewsService) {}

  // Obsługuje połączenie klienta
  handleConnection(client: Socket, ...args: any[]) {
    // Pobieramy tenant_id z nagłówka połączenia
    const tenantId = client.handshake.headers['tenant-id'];

    // Sprawdzamy, czy tenantId jest tablicą, jeśli tak to bierzemy pierwszy element
    const tenant = Array.isArray(tenantId) ? tenantId[0] : tenantId;

    if (!tenant) {
      console.log('Client connected without tenant_id');
      client.disconnect();
      return;
    }

    // Dodajemy połączenie do odpowiedniego tenant_id
    if (!this.tenantsConnections.has(tenant)) {
      this.tenantsConnections.set(tenant, new Set());
    }
    this.tenantsConnections.get(tenant)?.add(client);

    console.log(`Client connected: ${client.id} for tenant ${tenant}`);
  }

  // Obsługuje rozłączenie klienta
  handleDisconnect(client: Socket) {
    // Usuwamy połączenie z mapy
    this.tenantsConnections.forEach((clients, tenant) => {
      clients.delete(client);
      if (clients.size === 0) {
        this.tenantsConnections.delete(tenant); // Usuwamy tenant_id, jeśli nie ma żadnych aktywnych połączeń
      }
    });

    console.log(`Client disconnected: ${client.id}`);
  }

  // Obsługuje żądanie live update
  @SubscribeMessage('liveUpdate')
  async handleLiveUpdate(@MessageBody() data: { tenant_id: string }) {
    const tenantId = data.tenant_id;

    // Pobieramy najnowsze newsy dla danego tenant_id
    const news = await this.newsService.findByTenant(tenantId);

    // Wysyłamy zaktualizowane newsy tylko do klientów tego tenant_id
    if (this.tenantsConnections.has(tenantId)) {
      const clients = this.tenantsConnections.get(tenantId);
      clients?.forEach(client => {
        client.emit('newsUpdated', news); // Wysyłamy zaktualizowane newsy do tego klienta
      });
    }
  }
}
