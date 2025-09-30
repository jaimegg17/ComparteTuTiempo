import { MessageEntity } from '../domain/message.entity';

export class MessageMapper {
  static toDomain(prismaMessage: any): MessageEntity {
    return new MessageEntity(
      prismaMessage.id,
      prismaMessage.content,
      prismaMessage.senderId,
      prismaMessage.receiverId,
      prismaMessage.createdAt,
    );
  }

  static toPrisma(message: MessageEntity): any {
    return {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      receiverId: message.receiverId,
      createdAt: message.createdAt,
    };
  }

  static toPrismaCreate(data: any): any {
    return {
      content: data.content,
      senderId: data.senderId,
      receiverId: data.receiverId,
    };
  }
}
