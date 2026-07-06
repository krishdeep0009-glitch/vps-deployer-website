import { IsString, IsOptional, IsInt, IsArray, IsNumber } from 'class-validator';

export class CreateNodeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  labels?: string[];
}

export class RegisterAgentDto {
  @IsString()
  agentToken: string;

  @IsOptional() @IsString() hostname?: string;
  @IsOptional() @IsString() os?: string;
  @IsOptional() @IsString() virtualization?: string;
  @IsOptional() @IsInt() cpuCores?: number;
  @IsOptional() @IsInt() ramMb?: number;
  @IsOptional() @IsInt() diskGb?: number;
  @IsOptional() @IsString() ipAddress?: string;
}

export class HeartbeatDto {
  @IsString()
  agentToken: string;

  @IsNumber() cpuUsage: number;
  @IsNumber() ramUsage: number;
  @IsNumber() diskUsage: number;
  @IsOptional() @IsNumber() netRxKb?: number;
  @IsOptional() @IsNumber() netTxKb?: number;
}
