import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { MEMBERSHIP_REPOSITORY_TOKEN } from '../domain/tokens';
import { MembershipRepositoryPort } from '../domain/membership-repository.port';
import { MembershipUpdate } from '@comparte-tu-tiempo/contracts';
import { MembershipEntity } from '../domain/membership.entity';

export interface UpdateMembershipRequest {
  id: number;
  data: MembershipUpdate;
  userId: string;
}

export interface UpdateMembershipResponse {
  membership: MembershipEntity;
}

@Injectable()
export class UpdateMembershipUseCase {
  constructor(
    @Inject(MEMBERSHIP_REPOSITORY_TOKEN)
    private readonly membershipRepository: MembershipRepositoryPort,
  ) {}

  async execute(request: UpdateMembershipRequest): Promise<UpdateMembershipResponse> {
    const { id, data, userId } = request;
    const current = await this.membershipRepository.findById(id);
    if (!current) {
      throw new NotFoundException('Membresía no encontrada');
    }

    // Only the same user or admins/moderators can update role/status in a real app.
    if (current.userId !== userId) {
      throw new ForbiddenException('No autorizado para actualizar esta membresía');
    }

    const membership = await this.membershipRepository.update(id, data);
    return { membership };
  }
}


