import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateContainerDto } from './dto/containers.dto';

/**
 * This service manages container *records* and emits lifecycle commands over
 * WebSocket to the owning node's agent. The actual LXC/Docker/KVM execution
 * happens in the agent (see agent/src/lxc.ts) — this keeps the panel
 * virtualization-agnostic and lets the agent be the only thing that needs
 * host privileges.
 */
@Injectable()
export class ContainersService {
  constructor(private prisma: PrismaService, private gateway: RealtimeGateway) {}

  async create(dto: CreateContainerDto) {
    const container = await this.prisma.container.create({
      data: {
        nodeId: dto.nodeId,
        name: dto.name,
        ctType: dto.ctType,
        osTemplate: dto.osTemplate,
        cpuLimit: dto.cpuLimit,
        ramLimitMb: dto.ramLimitMb,
        diskLimitGb: dto.diskLimitGb,
        status: 'CREATING',
      },
    });

    this.gateway.server?.emit(`node:${dto.nodeId}:command`, {
      command: 'create',
      containerId: container.id,
      ctType: dto.ctType,
      osTemplate: dto.osTemplate,
      cpuLimit: dto.cpuLimit,
      ramLimitMb: dto.ramLimitMb,
      diskLimitGb: dto.diskLimitGb,
    });

    return container;
  }

  async findAll(nodeId?: string) {
    return this.prisma.container.findMany({ where: nodeId ? { nodeId } : undefined });
  }

  async findOne(id: string) {
    const container = await this.prisma.container.findUnique({ where: { id } });
    if (!container) throw new NotFoundException('Container not found');
    return container;
  }

  async action(id: string, action: string) {
    const container = await this.findOne(id);

    this.gateway.server?.emit(`node:${container.nodeId}:command`, {
      command: action,
      containerId: container.id,
    });

    // Optimistic status update; agent will report back the real state via a
    // future `container:status` webhook (not yet implemented in this scaffold).
    const statusMap: Record<string, any> = {
      start: 'RUNNING',
      stop: 'STOPPED',
      restart: 'RUNNING',
      suspend: 'SUSPENDED',
      unsuspend: 'RUNNING',
      delete: 'DELETED',
    };
    if (statusMap[action]) {
      const updated = await this.prisma.container.update({
        where: { id },
        data: { status: statusMap[action] },
      });
      this.gateway.broadcastContainerUpdate(updated);
      return updated;
    }
    return container;
  }
}
