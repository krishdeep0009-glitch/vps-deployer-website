import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ContainersService } from './containers.service';
import { CreateContainerDto, ContainerActionDto } from './dto/containers.dto';

@ApiTags('containers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('containers')
export class ContainersController {
  constructor(private containersService: ContainersService) {}

  @Roles('RESELLER', 'ADMIN', 'SUPER_ADMIN')
  @Post()
  create(@Body() dto: CreateContainerDto) {
    return this.containersService.create(dto);
  }

  @Get()
  findAll(@Query('nodeId') nodeId?: string) {
    return this.containersService.findAll(nodeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.containersService.findOne(id);
  }

  @Roles('RESELLER', 'ADMIN', 'SUPER_ADMIN')
  @Post(':id/action')
  action(@Param('id') id: string, @Body() dto: ContainerActionDto) {
    return this.containersService.action(id, dto.action);
  }
}
