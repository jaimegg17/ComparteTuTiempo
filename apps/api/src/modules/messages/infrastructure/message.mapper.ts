import { MessageEntity } from '../domain/message.entity';
import type { MessageCreate } from '@comparte-tu-tiempo/contracts';
import type { Prisma } from '@prisma/client';

interface MessagePersistence {
  id: number;
  exchangeId: number;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class MessageMapper {
  static toDomain(prismaMessage: MessagePersistence): MessageEntity {
    return new MessageEntity(
      prismaMessage.id,
      prismaMessage.exchangeId,
      prismaMessage.senderId,
      prismaMessage.content,
      prismaMessage.isRead,
      prismaMessage.createdAt,
      prismaMessage.updatedAt,
    );
  }

  static toPrisma(message: MessageEntity): MessagePersistence {
    return {
      id: message.id,
      exchangeId: message.exchangeId,
      senderId: message.senderId,
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }

  static toPrismaCreate(data: MessageCreate & { senderId: string }): Prisma.MessageUncheckedCreateInput {
    return {
      exchangeId: data.exchangeId,
      senderId: data.senderId,
      content: data.content,
      isRead: false,
    };
  }
}
