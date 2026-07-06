import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' }, path: '/ws' })
export class RealtimeGateway {
  @WebSocketServer()
  server: Server;

  broadcastNodeUpdate(node: any, liveMetrics?: { cpuUsage: number; ramUsage: number; diskUsage: number }) {
    this.server?.emit('node:update', { node, liveMetrics });
  }

  broadcastContainerUpdate(container: any) {
    this.server?.emit('container:update', container);
  }
}
