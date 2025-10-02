import { Controller, Post, Get, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { CreateMessageUseCase } from '../application/create-message.use-case';
import { ListMessagesUseCase } from '../application/list-messages.use-case';
import { UpdateMessageUseCase } from '../application/update-message.use-case';
import { MessageCreate, MessageListQuery, MessageUpdate } from '../domain/message.types';
import { JwtAuthGuard } from '@/common/auth/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(
    private readonly createMessageUseCase: CreateMessageUseCase,
    private readonly listMessagesUseCase: ListMessagesUseCase,
    private readonly updateMessageUseCase: UpdateMessageUseCase,
  ) {}

  @Post()
  async createMessage(
    @Body() data: MessageCreate,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    const result = await this.createMessageUseCase.execute({ data, userId });
    return result;
  }

  @Get('exchange/:exchangeId')
  async listMessages(
    @Request() req: any,
    @Param('exchangeId') exchangeId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const userId = req.user.sub;
    const query: MessageListQuery = {
      exchangeId: parseInt(exchangeId),
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 50,
    };
    
    const result = await this.listMessagesUseCase.execute({ query, userId });
    return result;
  }

  @Put(':id')
  async updateMessage(
    @Request() req: any,
    @Param('id') id: string,
    @Body() data: MessageUpdate,
  ) {
    const userId = req.user.sub;
    const result = await this.updateMessageUseCase.execute({
      id: parseInt(id),
      data,
      userId,
    });
    return result;
  }

  @Put(':id/read')
  async markAsRead(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    const userId = req.user.sub;
    const result = await this.updateMessageUseCase.execute({
      id: parseInt(id),
      data: { isRead: true },
      userId,
    });
    return result;
  }
}
