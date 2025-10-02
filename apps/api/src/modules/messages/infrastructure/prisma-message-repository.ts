import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import type { MessageRepositoryPort } from '../domain/message-repository.port';
import { MessageEntity } from '../domain/message.types';
import { MessageCreate, MessageListQuery, MessageListResponse, MessageUpdate } from '../domain/message.types';

@Injectable()
export class PrismaMessageRepository implements MessageRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: MessageCreate, senderId: string): Promise<MessageEntity> {
    const prismaMessage = await this.prisma.message.create({
      data: {
        exchangeId: data.exchangeId,
        senderId,
        content: data.content,
        isRead: false,
      },
    });

    return {
      id: prismaMessage.id,
      exchangeId: prismaMessage.exchangeId,
      senderId: prismaMessage.senderId,
      content: prismaMessage.content,
      isRead: prismaMessage.isRead,
      createdAt: prismaMessage.createdAt,
      updatedAt: prismaMessage.updatedAt,
    };
  }

  async findById(id: number): Promise<MessageEntity | null> {
    const prismaMessage = await this.prisma.message.findUnique({
      where: { id },
    });

    if (!prismaMessage) {
      return null;
    }

    return {
      id: prismaMessage.id,
      exchangeId: prismaMessage.exchangeId,
      senderId: prismaMessage.senderId,
      content: prismaMessage.content,
      isRead: prismaMessage.isRead,
      createdAt: prismaMessage.createdAt,
      updatedAt: prismaMessage.updatedAt,
    };
  }

  async list(query: MessageListQuery): Promise<MessageListResponse> {
    const { exchangeId, page = 1, pageSize = 50 } = query;
    const skip = (page - 1) * pageSize;

    const [total, prismaMessages] = await Promise.all([
      this.prisma.message.count({
        where: { exchangeId },
      }),
      this.prisma.message.findMany({
        where: { exchangeId },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const messages = prismaMessages.map(prismaMessage => ({
      id: prismaMessage.id,
      exchangeId: prismaMessage.exchangeId,
      senderId: prismaMessage.senderId,
      content: prismaMessage.content,
      isRead: prismaMessage.isRead,
      createdAt: prismaMessage.createdAt,
      updatedAt: prismaMessage.updatedAt,
    }));

    const totalPages = Math.ceil(total / pageSize);

    return {
      messages,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async update(id: number, data: MessageUpdate): Promise<MessageEntity> {
    const prismaMessage = await this.prisma.message.update({
      where: { id },
      data,
    });

    return {
      id: prismaMessage.id,
      exchangeId: prismaMessage.exchangeId,
      senderId: prismaMessage.senderId,
      content: prismaMessage.content,
      isRead: prismaMessage.isRead,
      createdAt: prismaMessage.createdAt,
      updatedAt: prismaMessage.updatedAt,
    };
  }

  async markAsRead(messageIds: number[]): Promise<void> {
    await this.prisma.message.updateMany({
      where: {
        id: { in: messageIds },
      },
      data: {
        isRead: true,
      },
    });
  }

  async getUnreadCount(userId: string, exchangeId: number): Promise<number> {
    return this.prisma.message.count({
      where: {
        exchangeId,
        senderId: { not: userId }, // Messages not sent by the current user
        isRead: false,
      },
    });
  }
}