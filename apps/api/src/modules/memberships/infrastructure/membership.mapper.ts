import { MembershipEntity } from '../domain/membership.entity';
import type { MembershipCreate } from '@comparte-tu-tiempo/contracts';

interface MembershipPersistence {
  id: number;
  userId: string;
  groupId: number;
  role: 'MEMBER' | 'MODERATOR' | 'ADMIN';
  status: 'ACTIVA' | 'PENDIENTE' | 'SUSPENDIDA';
  joinedAt: Date;
}

export class MembershipMapper {
  static toDomain(prismaMembership: MembershipPersistence): MembershipEntity {
    return new MembershipEntity(
      prismaMembership.id,
      prismaMembership.userId,
      prismaMembership.groupId,
      prismaMembership.role,
      prismaMembership.status,
      prismaMembership.joinedAt,
    );
  }

  static toPrismaCreate(
    data: MembershipCreate,
  ): Pick<MembershipPersistence, 'userId' | 'groupId' | 'role' | 'status'> {
    return {
      userId: data.userId,
      groupId: data.groupId,
      role: data.role,
      status: data.status,
    };
  }
}

