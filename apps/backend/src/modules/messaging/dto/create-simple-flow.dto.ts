import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSimpleFlowDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Frontend event ID (e.g. first_tag, repeat_tag)' })
  @IsNotEmpty()
  @IsString()
  event: string;

  @ApiProperty({ description: 'Condition string (e.g. delay: 2 hours)' })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiProperty({ description: 'Action ID (e.g. send_sms, send_whatsapp)' })
  @IsNotEmpty()
  @IsString()
  action: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  branchId?: string;
}
