import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNodeDto, RegisterAgentDto, HeartbeatDto } from './dto/nodes.dto';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class NodesService {
  constructor(private prisma: PrismaService, private gateway: RealtimeGateway) {}

  /** Admin creates a node record and gets back a one-line install command using a fresh agent token. */
  async create(dto: CreateNodeDto) {
    const agentToken = randomBytes(24).toString('hex');
    const node = await this.prisma.node.create({
      data: { name: dto.name, labels: dto.labels ?? [], agentToken, status: 'PENDING' },
    });
    return {
      node,
      installCommand: `curl -fsSL ${process.env.PANEL_PUBLIC_URL || 'http://localhost:8006'}/install-agent.sh | bash -s -- --token=${agentToken} --panel=${process.env.PANEL_PUBLIC_URL || 'http://localhost:8006'}`,
    };
  }

  findAll() {
    return this.prisma.node.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findByToken(agentToken: string) {
    const node = await this.prisma.node.findUnique({ where: { agentToken } });
    if (!node) throw new UnauthorizedException('Invalid agent token');
    return node;
  }

  /** Called by the node agent on first boot to report detected system info. */
  async registerAgent(dto: RegisterAgentDto) {
    const node = await this.findByToken(dto.agentToken);
    const updated = await this.prisma.node.update({
      where: { id: node.id },
      data: {
        hostname: dto.hostname,
        os: dto.os,
        virtualization: dto.virtualization,
        cpuCores: dto.cpuCores,
        ramMb: dto.ramMb,
        diskGb: dto.diskGb,
        ipAddress: dto.ipAddress,
        status: 'ONLINE',
        lastHeartbeat: new Date(),
      },
    });
    this.gateway.broadcastNodeUpdate(updated);
    return updated;
  }

  /** Called periodically by the node agent. */
  async ingestHeartbeat(dto: HeartbeatDto) {
    const node = await this.findByToken(dto.agentToken);

    await this.prisma.nodeMetric.create({
      data: {
        nodeId: node.id,
        cpuUsage: dto.cpuUsage,
        ramUsage: dto.ramUsage,
        diskUsage: dto.diskUsage,
        netRxKb: dto.netRxKb ?? 0,
        netTxKb: dto.netTxKb ?? 0,
      },
    });

    const updated = await this.prisma.node.update({
      where: { id: node.id },
      data: { status: 'ONLINE', lastHeartbeat: new Date() },
    });

    this.gateway.broadcastNodeUpdate(updated, {
      cpuUsage: dto.cpuUsage,
      ramUsage: dto.ramUsage,
      diskUsage: dto.diskUsage,
    });

    return { ok: true };
  }

  async findOne(id: string) {
    const node = await this.prisma.node.findUnique({ where: { id }, include: { containers: true } });
    if (!node) throw new NotFoundException('Node not found');
    return node;
  }

  /** Marks nodes offline if no heartbeat received in the last 60s. Call from a cron/interval. */
  async markStaleOffline() {
    const cutoff = new Date(Date.now() - 60_000);
    const stale = await this.prisma.node.findMany({
      where: { status: 'ONLINE', lastHeartbeat: { lt: cutoff } },
    });
    for (const node of stale) {
      const updated = await this.prisma.node.update({ where: { id: node.id }, data: { status: 'OFFLINE' } });
      this.gateway.broadcastNodeUpdate(updated);
    }
  }
}
