import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { MessageRepositoryPort } from '../domain/message-repository.port';
import { MessageCreate } from '@comparte-tu-tiempo/contracts';
import { MessageEntity } from '../domain/message.entity';
import { MESSAGE_REPOSITORY_TOKEN } from '../domain/tokens';

export interface CreateMessageRequest {
  data: MessageCreate;
  userId: string; // The user sending the message
}

export interface CreateMessageResponse {
  message: MessageEntity;
}

@Injectable()
export class CreateMessageUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY_TOKEN)
    private readonly messageRepository: MessageRepositoryPort
  ) {}

  async execute(request: CreateMessageRequest): Promise<CreateMessageResponse> {
    const { data, userId } = request;

    // Business logic validation
    if (data.receiverId === userId) {
      throw new BadRequestException('No puedes enviarte mensajes a ti mismo');
    }

    if (!data.content || data.content.trim().length === 0) {
      throw new BadRequestException('El contenido del mensaje no puede estar vacío');
    }

    if (data.content.length > 1000) {
      throw new BadRequestException('El mensaje no puede exceder 1000 caracteres');
    }

    // Add senderId from the authenticated user
    const messageData = {
      ...data,
      senderId: userId,
    };

    const message = await this.messageRepository.create(messageData);

    return { message };
  }
}
