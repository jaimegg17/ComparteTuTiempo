import { 
  Controller, 
  Get, 
  Post, 
  Put,
  BadRequestException,
  Body, 
  Query, 
  UseGuards, 
  UnauthorizedException,
  Request,
  Param,
  ParseIntPipe 
} from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { createZodDto } from '@anatine/zod-nestjs';
import { 
  MessageCreateSchema, 
  MessageListQuerySchema 
} from '@comparte-tu-tiempo/contracts';
import { CreateMessageUseCase } from '../application/create-message.use-case';
import { ListConversationsUseCase } from '../application/list-conversations.use-case';
import { ListMessagesUseCase } from '../application/list-messages.use-case';
import { GetMessagesByExchangeUseCase } from '../application/get-messages-by-exchange.use-case';
import { MarkMessageReadUseCase } from '../application/mark-message-read.use-case';
import { JwtAuthGuard } from '@/common/auth/jwt-auth.guard';

// DTOs generados desde Zod
export class CreateMessageDto extends createZodDto(MessageCreateSchema) {}

// Query DTO for listing messages
export class MessageListQueryDto extends createZodDto(MessageListQuerySchema) {}

class MessagePaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  pageSize?: number;
}

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(
    private readonly createMessageUseCase: CreateMessageUseCase,
    private readonly listConversationsUseCase: ListConversationsUseCase,
    private readonly listMessagesUseCase: ListMessagesUseCase,
    private readonly getMessagesByExchangeUseCase: GetMessagesByExchangeUseCase,
    private readonly markMessageReadUseCase: MarkMessageReadUseCase,
  ) {}

  private getAuthenticatedUserId(req: { user?: { sub?: string; id?: string } }): string {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return userId;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enviar un nuevo mensaje' })
  @ApiResponse({ status: 201, description: 'Mensaje enviado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async createMessage(
    @Body() createMessageDto: CreateMessageDto,
    @Request() req: { user?: { sub?: string; id?: string } },
  ) {
    const userId = this.getAuthenticatedUserId(req);

    if (!createMessageDto.exchangeId) {
      throw new BadRequestException('exchangeId is required');
    }

    const result = await this.createMessageUseCase.execute({
      data: {
        exchangeId: createMessageDto.exchangeId,
        content: createMessageDto.content,
      },
      userId,
    });

    return {
      message: 'Mensaje enviado exitosamente',
      data: result.message.toContract(),
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar mensajes del usuario' })
  @ApiResponse({ status: 200, description: 'Lista de mensajes obtenida' })
  async listMessages(
    @Query() query: MessageListQueryDto,
    @Request() req: { user?: { sub?: string; id?: string } },
  ) {
    const userId = this.getAuthenticatedUserId(req);

    if (!query.exchangeId) {
      throw new BadRequestException('exchangeId is required in query params');
    }
    
    // Asegurar que page y pageSize estén presentes
    const queryWithDefaults = {
      page: query.page || 1,
      pageSize: query.pageSize || 20,
      exchangeId: query.exchangeId,
    };

    const result = await this.listMessagesUseCase.execute({ 
      query: queryWithDefaults,
      userId 
    });

    return {
      message: 'Mensajes obtenidos exitosamente',
      ...result.messages,
      messages: result.messages.messages.map(message => message.toContract()),
    };
  }

  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar conversaciones del usuario' })
  @ApiResponse({ status: 200, description: 'Lista de conversaciones obtenida' })
  async listConversations(@Request() req: { user?: { sub?: string; id?: string } }) {
    const userId = this.getAuthenticatedUserId(req);

    const result = await this.listConversationsUseCase.execute(userId);

    return {
      message: 'Conversaciones obtenidas exitosamente',
      conversations: result.conversations.map(conversation => ({
        ...conversation,
        lastMessage: conversation.lastMessage
          ? conversation.lastMessage.toContract()
          : null,
      })),
    };
  }

  @Get('exchange/:exchangeId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener mensajes de un intercambio específico' })
  @ApiParam({ name: 'exchangeId', description: 'ID del intercambio', type: Number })
  @ApiResponse({ status: 200, description: 'Mensajes obtenidos exitosamente' })
  async getMessagesByExchange(
    @Param('exchangeId', ParseIntPipe) exchangeId: number,
    @Query() query: MessagePaginationQueryDto,
    @Request() req?: { user?: { sub?: string; id?: string } },
  ) {
    const userId = this.getAuthenticatedUserId(req ?? {});

    const result = await this.getMessagesByExchangeUseCase.execute({
      exchangeId,
      userId,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
    });

    return {
      message: 'Mensajes obtenidos exitosamente',
      ...result.messages,
      messages: result.messages.messages.map(message => message.toContract()),
    };
  }

  @Put(':id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar un mensaje como leído' })
  @ApiParam({ name: 'id', description: 'ID del mensaje', type: Number })
  @ApiResponse({ status: 200, description: 'Mensaje marcado como leído' })
  @ApiResponse({ status: 404, description: 'Mensaje no encontrado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  async markMessageAsRead(
    @Param('id', ParseIntPipe) messageId: number,
    @Request() req: { user?: { sub?: string; id?: string } },
  ) {
    const userId = this.getAuthenticatedUserId(req);

    const result = await this.markMessageReadUseCase.execute({
      messageId,
      userId,
    });

    return {
      message: 'Mensaje marcado como leído',
      data: result.message.toContract(),
    };
  }
}
