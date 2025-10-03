import { Message as PrismaMessage } from '@prisma/client';

export class MessageEntity {
  constructor(
    public readonly id: number,
    public readonly exchangeId: number,
    public readonly senderId: string,
    public readonly content: string,
    public readonly isRead: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromPrisma(prismaMessage: PrismaMessage): MessageEntity {
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

  toDomain(): MessageEntity {
    return this;
  }

  toContract(): any {
    return {
      id: this.id,
      exchangeId: this.exchangeId,
      senderId: this.senderId,
      content: this.content,
      isRead: this.isRead,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  markAsRead(): MessageEntity {
    return new MessageEntity(
      this.id,
      this.exchangeId,
      this.senderId,
      this.content,
      true,
      this.createdAt,
      this.updatedAt,
    );
  }
}