import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flow, FlowStatus, FlowTriggerType } from '../entities/flow.entity';
import { FlowExecution, ExecutionStatus } from '../entities/flow-execution.entity';
import { MessagingEngineService } from './messaging-engine.service';
import { Contact } from '../../contacts/entities/contact.entity';
import { SendMessageDto } from '../dto/send-message.dto';
import { Channel } from '../enums/channel.enum';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateSimpleFlowDto } from '../dto/create-simple-flow.dto';

@Injectable()
export class FlowEngineService {
  private readonly logger = new Logger(FlowEngineService.name);

  constructor(
    @InjectRepository(Flow)
    private readonly flowRepo: Repository<Flow>,
    @InjectRepository(FlowExecution)
    private readonly executionRepo: Repository<FlowExecution>,
    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>,
    private readonly messagingEngine: MessagingEngineService,
    @InjectQueue('messaging-flow-delay') private readonly delayQueue: Queue,
  ) {}

  async createSimpleFlow(dto: CreateSimpleFlowDto, businessId: string): Promise<Flow> {
    const triggerType = this.mapEventToTrigger(dto.event);
    const nodes = [];
    const edges = [];

    // Trigger is implicit in Flow metadata, but for structure visualization we might want a Start node
    // Step 1: Start Node (Trigger)
    nodes.push({
        id: 'start',
        type: 'trigger',
        data: { trigger: triggerType },
        position: { x: 0, y: 0 }
    });

    let previousNodeId = 'start';

    // Step 2: Condition (Delay)
    if (dto.condition && dto.condition.startsWith('delay:')) {
        const delayParts = dto.condition.replace('delay:', '').trim().split(' ');
        const time = parseInt(delayParts[0]);
        const unit = delayParts[1]; // hours, days etc.

        nodes.push({
            id: 'delay_node',
            type: 'delay',
            data: { time, unit },
            position: { x: 0, y: 100 }
        });
        edges.push({
            id: 'e1',
            source: 'start',
            target: 'delay_node'
        });
        previousNodeId = 'delay_node';
    }

    // Step 3: Action (Message)
    const channel = this.mapActionToChannel(dto.action);
    if (channel) { // If it's a message action
        nodes.push({
            id: 'message_node',
            type: 'send_message',
            data: {
                message: `Automated message for ${dto.name}`, // Placeholder content, should come from DTO or template
                channel
            },
            position: { x: 0, y: 200 }
        });
        edges.push({
            id: `e_${previousNodeId}_message`,
            source: previousNodeId,
            target: 'message_node'
        });
    }

    const flow = this.flowRepo.create({
        businessId,
        branchId: dto.branchId,
        name: dto.name,
        triggerType,
        status: FlowStatus.ACTIVE, // Auto-activate simple flows
        structure: { nodes, edges }
    });

    return this.flowRepo.save(flow);
  }

  async getSimpleFlows(branchId: string): Promise<any[]> {
      const flows = await this.flowRepo.find({ where: { branchId } });
      return flows.map(flow => {
          // Reverse map to simple structure
          // This is a "best effort" mapping since flows can be complex
          const trigger = flow.triggerType;
          const delayNode = flow.structure?.nodes?.find((n: any) => n.type === 'delay');
          const messageNode = flow.structure?.nodes?.find((n: any) => n.type === 'send_message');

          let condition = 'immediate';
          if (delayNode) {
              condition = `delay: ${delayNode.data.time} ${delayNode.data.unit}`;
          }

          let action = 'unknown';
          if (messageNode) {
              if (messageNode.data.channel === Channel.SMS) action = 'send_sms';
              if (messageNode.data.channel === Channel.WHATSAPP) action = 'send_whatsapp';
              if (messageNode.data.channel === Channel.EMAIL) action = 'send_email';
          }

          return {
              id: flow.id,
              name: flow.name,
              event: this.mapTriggerToEvent(trigger),
              condition,
              action,
              active: flow.status === FlowStatus.ACTIVE
          };
      });
  }

  private mapEventToTrigger(event: string): FlowTriggerType {
      switch(event) {
          case 'first_tag': return FlowTriggerType.NEW_VISITOR;
          case 'repeat_tag': return FlowTriggerType.REPEAT_VISIT; // Or TAG_APPLIED
          case 'reward_earned': return FlowTriggerType.LOYALTY_MILESTONE;
          case 'survey_completed': return FlowTriggerType.SURVEY_COMPLETED;
          default: return FlowTriggerType.MANUAL;
      }
  }

  private mapTriggerToEvent(trigger: FlowTriggerType): string {
      switch(trigger) {
          case FlowTriggerType.NEW_VISITOR: return 'first_tag';
          case FlowTriggerType.REPEAT_VISIT: return 'repeat_tag';
          case FlowTriggerType.LOYALTY_MILESTONE: return 'reward_earned';
          case FlowTriggerType.SURVEY_COMPLETED: return 'survey_completed';
          default: return 'manual';
      }
  }

  private mapActionToChannel(action: string): Channel | null {
      if (action === 'send_sms') return Channel.SMS;
      if (action === 'send_whatsapp') return Channel.WHATSAPP;
      if (action === 'send_email') return Channel.EMAIL;
      return null;
  }

  // ... (Existing triggerFlow, executeNode, handlers, helpers remain unchanged) ...

  async triggerFlow(triggerType: FlowTriggerType, branchId: string, context: any): Promise<void> {
    this.logger.log(`Triggering flow: ${triggerType} for branch ${branchId}`);

    // 1. Find active flows for this trigger
    const flows = await this.flowRepo.find({
      where: {
        branchId,
        triggerType,
        status: FlowStatus.ACTIVE,
      },
    });

    if (!flows.length) return;

    // 2. Resolve Contact
    let contact: Contact | null = null;
    if (context.contactId) {
        contact = await this.contactRepo.findOne({ where: { id: context.contactId } });
    }
    // Handle other context lookups if needed (phone, etc.)

    if (!contact) {
        this.logger.warn(`No contact found for flow trigger context: ${JSON.stringify(context)}`);
        return;
    }

    // 3. Start Execution for each flow
    for (const flow of flows) {
        // Check for duplicates? PRD says "Prevent duplicate enrollments"
        const existing = await this.executionRepo.findOne({
            where: {
                flowId: flow.id,
                contactId: contact.id,
                status: ExecutionStatus.RUNNING // or WAITING
            }
        });
        if (existing) {
            this.logger.log(`Skipping duplicate enrollment for contact ${contact.id} in flow ${flow.id}`);
            continue;
        }

        const execution = this.executionRepo.create({
            flowId: flow.id,
            contactId: contact.id,
            businessId: flow.businessId,
            branchId: flow.branchId,
            status: ExecutionStatus.RUNNING,
            state: { ...context }, // Initialize state with trigger context
            currentNodeId: this.getStartNodeId(flow.structure)
        });
        await this.executionRepo.save(execution);

        // Run the first node
        await this.executeNode(execution.id, execution.currentNodeId);
    }
  }

  async executeNode(executionId: string, nodeId: string): Promise<void> {
    const execution = await this.executionRepo.findOne({
        where: { id: executionId },
        relations: ['flow', 'contact']
    });
    if (!execution || !execution.flow) return;

    const node = execution.flow.structure.nodes.find((n: any) => n.id === nodeId);
    if (!node) {
        // End of flow or invalid node
        await this.completeExecution(execution);
        return;
    }

    this.logger.log(`Executing node ${node.id} (${node.type}) for execution ${execution.id}`);

    try {
        switch (node.type) {
            case 'send_message':
                await this.handleSendMessage(execution, node);
                break;
            case 'delay':
                await this.handleDelay(execution, node);
                return; // Stop execution here, wait for delay job
            case 'condition':
                await this.handleCondition(execution, node);
                return; // Logic branches, so we return to avoid default next step
            // Add other types: tag, loyalty, etc.
            default:
                this.logger.warn(`Unknown node type ${node.type}`);
                await this.moveToNextNode(execution, node.id);
                break;
        }
    } catch (error) {
        this.logger.error(`Error executing node ${node.id}: ${error.message}`);
        execution.status = ExecutionStatus.FAILED;
        await this.executionRepo.save(execution);
    }
  }

  // --- Handlers ---

  private async handleSendMessage(execution: FlowExecution, node: any) {
      // PRD 7.1: Message Type, Content, Media
      const content = node.data?.message || '';
      // Assuming channel is WhatsApp as per PRD "WhatsApp Flow Builder"
      // But we could make it generic. For now, defaulting to WhatsApp via Termii.

      const dto: SendMessageDto = {
          businessId: execution.businessId,
          branchId: execution.branchId,
          channel: Channel.WHATSAPP,
          content,
          contactIds: [execution.contactId],
          // templateId if node uses template
      };

      const result = await this.messagingEngine.sendMessage(dto);
      execution.lastMessageId = result.messageIds?.[0] || '';
      await this.executionRepo.save(execution);

      // Move to next node immediately after sending
      await this.moveToNextNode(execution, node.id);
  }

  private async handleDelay(execution: FlowExecution, node: any) {
      // PRD 7.2: Delay Time, Unit
      const time = node.data?.time || 0;
      const unit = node.data?.unit || 'minutes';

      let delayMs = 0;
      if (unit === 'minutes') delayMs = time * 60 * 1000;
      if (unit === 'hours') delayMs = time * 60 * 60 * 1000;
      if (unit === 'days') delayMs = time * 24 * 60 * 60 * 1000;

      execution.status = ExecutionStatus.WAITING;
      execution.nextRunAt = new Date(Date.now() + delayMs);
      await this.executionRepo.save(execution);

      // Add to BullMQ with delay
      await this.delayQueue.add('process-delay', {
          executionId: execution.id,
          nodeId: node.id // The current delay node
      }, {
          delay: delayMs
      });
  }

  private async handleCondition(execution: FlowExecution, node: any) {
      // PRD 7.3: If User Replied, If No Reply, etc.
      // This is tricky.
      // 1. "If User Replied": We need to wait for a webhook.
      // 2. "If specific keyword": Check last reply.

      const conditionType = node.data?.conditionType;

      if (conditionType === 'if_replied') {
          // We must PAUSE execution and wait for inbound webhook.
          execution.status = ExecutionStatus.WAITING;
          execution.currentNodeId = node.id; // Stay on this node? Or move to a "wait" state?
          // Typically, we mark it as waiting for input.
          await this.executionRepo.save(execution);
          // We rely on handleInboundReply to resume this.
          return;
      }

      // Simple logic check (e.g. contact tags)
      // Evaluate...
      // Determine next path
      const result = true; // Placeholder evaluation

      const edgeLabel = result ? 'yes' : 'no';
      await this.moveToNextNode(execution, node.id, edgeLabel);
  }

  // --- Helpers ---

  async resumeExecution(executionId: string) {
      const execution = await this.executionRepo.findOne({ where: { id: executionId }, relations: ['flow'] });
      if (!execution) return;

      // If we were waiting at a Delay node, move to next
      // If we were waiting for Reply (Condition), process it

      if (execution.status === ExecutionStatus.WAITING) {
          execution.status = ExecutionStatus.RUNNING;
          await this.executionRepo.save(execution);

          // If resuming from delay, move next
          // If resuming from reply, logic is handled by handleReply
          await this.moveToNextNode(execution, execution.currentNodeId);
      }
  }

  private getStartNodeId(structure: any): string {
      // Find node with no incoming edges or marked as start
      // For simplicity, assuming first node or specific type 'start'
      // Or just the first in array if not specified.
      return structure.nodes?.[0]?.id;
  }

  private async moveToNextNode(execution: FlowExecution, currentNodeId: string, edgeLabel?: string) {
      // Find edge from currentNodeId
      const edges = execution.flow.structure.edges.filter((e: any) => e.source === currentNodeId);
      let nextEdge;

      if (edgeLabel) {
          nextEdge = edges.find((e: any) => e.label === edgeLabel || e.handle === edgeLabel);
      } else {
          nextEdge = edges[0]; // Default path
      }

      if (nextEdge) {
          execution.currentNodeId = nextEdge.target;
          await this.executionRepo.save(execution);
          await this.executeNode(execution.id, execution.currentNodeId);
      } else {
          await this.completeExecution(execution);
      }
  }

  private async completeExecution(execution: FlowExecution) {
      execution.status = ExecutionStatus.COMPLETED;
      execution.completedAt = new Date();
      await this.executionRepo.save(execution);
  }
}
