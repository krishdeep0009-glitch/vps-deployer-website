import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { NodesService } from './nodes.service';
import { CreateNodeDto, RegisterAgentDto, HeartbeatDto } from './dto/nodes.dto';

@ApiTags('nodes')
@Controller('nodes')
export class NodesController {
  constructor(private nodesService: NodesService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  create(@Body() dto: CreateNodeDto) {
    return this.nodesService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.nodesService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nodesService.findOne(id);
  }

  // --- Agent-facing endpoints, authenticated via agentToken in body, not JWT ---

  @Post('agent/register')
  registerAgent(@Body() dto: RegisterAgentDto) {
    return this.nodesService.registerAgent(dto);
  }

  @Post('agent/heartbeat')
  heartbeat(@Body() dto: HeartbeatDto) {
    return this.nodesService.ingestHeartbeat(dto);
  }
}
