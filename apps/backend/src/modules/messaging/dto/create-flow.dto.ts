import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FlowTriggerType } from '../entities/flow.entity';

export class CreateFlowDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ enum: FlowTriggerType })
  @IsEnum(FlowTriggerType)
  triggerType: FlowTriggerType;

  @ApiProperty()
  @IsOptional()
  structure?: any;

  @ApiProperty()
  @IsOptional()
  @IsString()
  branchId?: string;
}
