import { MessageEntity } from '../domain/message.entity';

export class MessageMapper {
  static toDomain(prismaMessage: any): MessageEntity {
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

  static toPrisma(message: MessageEntity): any {
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

  static toPrismaCreate(data: any): any {
    return {
      exchangeId: data.exchangeId,
      senderId: data.senderId,
      content: data.content,
      isRead: false,
    };
  }
}
