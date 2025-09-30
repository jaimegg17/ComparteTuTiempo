import { MembershipEntity } from '../domain/membership.entity';

export class MembershipMapper {
  static toDomain(prismaMembership: any): MembershipEntity {
    return new MembershipEntity(
      prismaMembership.id,
      prismaMembership.userId,
      prismaMembership.groupId,
      prismaMembership.role,
      prismaMembership.status,
      prismaMembership.joinedAt,
    );
  }

  static toPrismaCreate(data: any): any {
    return {
      userId: data.userId,
      groupId: data.groupId,
      role: data.role,
      status: data.status,
    };
  }
}


