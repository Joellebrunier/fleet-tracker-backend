import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

/**
 * GPS WebSocket Gateway
 *
 * Broadcasts real-time vehicle position updates to all connected clients.
 * The GpsDataPipelineService calls broadcastPosition() whenever a new
 * GPS data point is processed.
 *
 * Events:
 *   - vehicle:position  → { vehicleId, lat, lng, speed, heading, timestamp, provider }
 *   - fleet:stats       → { total, moving, stopped, withGps } (every 30s)
 */
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  namespace: '/gps',
})
export class GpsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GpsGateway.name);
  private connectedClients = 0;

  afterInit() {
    this.logger.log('GPS WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.connectedClients++;
    this.logger.debug(
      `Client connected: ${client.id} (total: ${this.connectedClients})`,
    );
  }

  handleDisconnect(client: Socket) {
    this.connectedClients--;
    this.logger.debug(
      `Client disconnected: ${client.id} (total: ${this.connectedClients})`,
    );
  }

  /**
   * Broadcast a vehicle position update to all connected clients
   */
  broadcastPosition(data: {
    vehicleId: string;
    lat: number;
    lng: number;
    speed: number;
    heading: number;
    timestamp: Date;
    provider: string;
  }): void {
    if (this.connectedClients > 0) {
      this.server.emit('vehicle:position', data);
    }
  }

  /**
   * Broadcast fleet statistics
   */
  broadcastFleetStats(stats: {
    total: number;
    moving: number;
    stopped: number;
    withGps: number;
  }): void {
    if (this.connectedClients > 0) {
      this.server.emit('fleet:stats', stats);
    }
  }

  getConnectedClients(): number {
    return this.connectedClients;
  }
}
