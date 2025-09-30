import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { MessageEntity } from '../domain/message.entity';
import { MessageRepositoryPort } from '../domain/message-repository.port';
import { MessageCreate, MessageListQuery } from '@comparte-tu-tiempo/contracts';
import { MessageMapper } from './message.mapper';

@Injectable()
export class PrismaMessageRepository implements MessageRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: MessageCreate): Promise<MessageEntity> {
    const prismaMessage = await this.prisma.message.create({
      data: MessageMapper.toPrismaCreate(data),
    });

    return MessageMapper.toDomain(prismaMessage);
  }

  async findById(id: number): Promise<MessageEntity | null> {
    const prismaMessage = await this.prisma.message.findUnique({
      where: { id },
    });

    return prismaMessage ? MessageMapper.toDomain(prismaMessage) : null;
  }

  async findByUserId(userId: string): Promise<MessageEntity[]> {
    const prismaMessages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return prismaMessages.map(MessageMapper.toDomain);
  }

  async findByConversation(userId1: string, userId2: string): Promise<MessageEntity[]> {
    const prismaMessages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    return prismaMessages.map(MessageMapper.toDomain);
  }

  async list(query: MessageListQuery): Promise<{
    messages: MessageEntity[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const { page, pageSize, userId } = query;
    const skip = (page - 1) * pageSize;

    // Build where clause - filter messages where user is involved
    const where: any = {
      OR: [
        { senderId: userId },
        { receiverId: userId },
      ],
    };

    // Get total count
    const total = await this.prisma.message.count({ where });

    // Get paginated results
    const prismaMessages = await this.prisma.message.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });

    const messages = prismaMessages.map(MessageMapper.toDomain);
    const totalPages = Math.ceil(total / pageSize);

    return {
      messages,
      total,
      page,
      pageSize,
      totalPages,
    };
  }
}
