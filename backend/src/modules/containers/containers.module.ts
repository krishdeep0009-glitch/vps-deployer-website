import { Module } from '@nestjs/common';
import { ContainersService } from './containers.service';
import { ContainersController } from './containers.controller';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [RealtimeModule],
  providers: [ContainersService],
  controllers: [ContainersController],
  exports: [ContainersService],
})
export class ContainersModule {}
