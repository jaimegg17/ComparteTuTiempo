import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { MessageEntity } from '../domain/message.entity';

export interface ConversationUserSummary {
  id: string;
  name: string;
  imageUrl?: string | null;
}

export interface ConversationServiceSummary {
  id: number;
  title: string;
}

export interface ConversationSummary {
  exchangeId: number;
  exchangeState: string;
  otherUser: ConversationUserSummary;
  service: ConversationServiceSummary | null;
  lastMessage: MessageEntity | null;
  lastMessageAt: Date;
  unreadCount: number;
}

export interface ListConversationsResponse {
  conversations: ConversationSummary[];
}

@Injectable()
export class ListConversationsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string): Promise<ListConversationsResponse> {
    const exchanges = await this.prisma.exchange.findMany({
      where: {
        OR: [
          { requestedById: userId },
          { offeredById: userId },
        ],
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        requestedBy: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        offeredBy: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    const exchangeIds = exchanges.map(exchange => exchange.id);
    const unreadCounts = exchangeIds.length
      ? await this.prisma.message.groupBy({
          by: ['exchangeId'],
          where: {
            exchangeId: { in: exchangeIds },
            isRead: false,
            senderId: { not: userId },
          },
          _count: {
            _all: true,
          },
        })
      : [];

    const unreadCountMap = new Map(
      unreadCounts.map(item => [item.exchangeId, item._count._all])
    );

    const conversations = exchanges.map(exchange => {
      const lastMessagePrisma = exchange.messages[0] ?? null;
      const lastMessage = lastMessagePrisma
        ? MessageEntity.fromPrisma(lastMessagePrisma)
        : null;
      const otherUser =
        exchange.requestedById === userId
          ? exchange.offeredBy
          : exchange.requestedBy;

      return {
        exchangeId: exchange.id,
        exchangeState: exchange.state,
        otherUser,
        service: exchange.service ?? null,
        lastMessage,
        lastMessageAt: lastMessagePrisma?.createdAt ?? exchange.updatedAt,
        unreadCount: unreadCountMap.get(exchange.id) ?? 0,
      } satisfies ConversationSummary;
    });

    return { conversations };
  }
}
