import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query, 
  UseGuards, 
  Request,
  Param,
  ParseIntPipe 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { createZodDto } from '@anatine/zod-nestjs';
import { 
  MessageCreateSchema, 
  MessageListQuerySchema 
} from '@comparte-tu-tiempo/contracts';
import { CreateMessageUseCase } from '../application/create-message.use-case';
import { ListMessagesUseCase } from '../application/list-messages.use-case';
import { JwtAuthGuard } from '@/common/auth/jwt-auth.guard';

// DTOs generados desde Zod
export class CreateMessageDto extends createZodDto(MessageCreateSchema) {}

// Simple query DTO without validation for now
export class MessageListQueryDto {
  userId?: string;
  page?: number;
  pageSize?: number;
}

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(
    private readonly createMessageUseCase: CreateMessageUseCase,
    private readonly listMessagesUseCase: ListMessagesUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enviar un nuevo mensaje' })
  @ApiResponse({ status: 201, description: 'Mensaje enviado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async createMessage(
    @Body() createMessageDto: CreateMessageDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    const result = await this.createMessageUseCase.execute({
      data: createMessageDto,
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
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    
    // Asegurar que page y pageSize estén presentes
    const queryWithDefaults = {
      page: query.page || 1,
      pageSize: query.pageSize || 20,
      userId,
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

  @Get('conversation/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener conversación con un usuario específico' })
  @ApiParam({ name: 'userId', description: 'ID del usuario con quien conversar' })
  @ApiResponse({ status: 200, description: 'Conversación obtenida exitosamente' })
  async getConversation(
    @Param('userId') otherUserId: string,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    
    // This would need a new use case for getting conversation
    // For now, we'll return a placeholder
    return {
      message: 'Conversación obtenida exitosamente',
      conversation: [],
      otherUserId,
    };
  }
}
