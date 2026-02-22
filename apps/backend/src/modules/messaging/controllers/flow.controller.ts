import { Controller, Post, Body, Get, Param, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { User, UserRole } from '../../users/entities/user.entity';
import { Flow, FlowStatus, FlowTriggerType } from '../entities/flow.entity';
import { CreateFlowDto } from '../dto/create-flow.dto';
import { CreateSimpleFlowDto } from '../dto/create-simple-flow.dto';
import { FlowEngineService } from '../services/flow-engine.service';

@ApiTags('Flow Builder')
@Controller('messaging/flows')
export class FlowController {
  constructor(
    @InjectRepository(Flow)
    private readonly flowRepo: Repository<Flow>,
    private readonly flowEngine: FlowEngineService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new complex flow' })
  @ApiBody({ type: CreateFlowDto })
  async create(@Body() dto: CreateFlowDto, @Request() req: any) {
    const user = req.user as User;

    let branchId = dto.branchId;
    if (user.role === UserRole.MANAGER || user.role === UserRole.STAFF) {
        branchId = user.branchId;
    } else if (user.role === UserRole.OWNER && !branchId) {
        throw new BadRequestException('branchId is required for flows created by Owner');
    }

    const flow = this.flowRepo.create({
      businessId: user.businessId,
      branchId,
      name: dto.name,
      triggerType: dto.triggerType,
      status: FlowStatus.DRAFT,
      structure: dto.structure || { nodes: [], edges: [] },
    });
    return this.flowRepo.save(flow);
  }

  @Post('simple')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a simplified automation rule (converts to flow)' })
  @ApiBody({ type: CreateSimpleFlowDto })
  async createSimple(@Body() dto: CreateSimpleFlowDto, @Request() req: any) {
    const user = req.user as User;

    let branchId = dto.branchId;
    if (user.role === UserRole.MANAGER || user.role === UserRole.STAFF) {
        branchId = user.branchId;
    } else if (user.role === UserRole.OWNER && !branchId) {
        throw new BadRequestException('branchId is required for flows created by Owner');
    }

    // Ensure DTO has the resolved branchId
    dto.branchId = branchId;

    return this.flowEngine.createSimpleFlow(dto, user.businessId);
  }

  @Get('simple')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: 'Get simplified automation rules' })
  async getSimple(@Query('branchId') branchId: string, @Request() req: any) {
    const user = req.user as User;
    // @ts-ignore
    const resolved = branchId || user.branchId;
    if (!resolved) throw new BadRequestException('branchId is required');

    return this.flowEngine.getSimpleFlows(resolved);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiOperation({ summary: 'Get all flows by branch' })
  async findAll(@Query('branchId') branchId: string, @Request() req: any) {
    const user = req.user as User;
    // @ts-ignore
    const resolved = branchId || user.branchId;
    if (!resolved) throw new BadRequestException('branchId is required');

    return this.flowRepo.find({
      where: { branchId: resolved, businessId: user.businessId },
    });
  }

  @Post(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update flow status (active/draft/paused)' })
  async updateStatus(@Param('id') id: string, @Body('status') status: FlowStatus, @Request() req: any) {
    const user = req.user as User;
    const flow = await this.flowRepo.findOne({ where: { id, businessId: user.businessId } });
    if (!flow) throw new BadRequestException('Flow not found');

    flow.status = status;
    return this.flowRepo.save(flow);
  }
}
