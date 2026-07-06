import { IsString, IsOptional, IsIn, IsInt } from 'class-validator';

export class CreateContainerDto {
  @IsString() nodeId: string;
  @IsString() name: string;
  @IsIn(['lxc', 'docker', 'kvm']) ctType: string;
  @IsOptional() @IsString() osTemplate?: string;
  @IsOptional() @IsInt() cpuLimit?: number;
  @IsOptional() @IsInt() ramLimitMb?: number;
  @IsOptional() @IsInt() diskLimitGb?: number;
}

export class ContainerActionDto {
  @IsIn(['start', 'stop', 'restart', 'suspend', 'unsuspend', 'delete', 'clone', 'snapshot', 'restore', 'reinstall'])
  action: string;
}
