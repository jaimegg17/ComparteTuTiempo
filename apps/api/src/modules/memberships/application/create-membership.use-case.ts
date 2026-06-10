import { Injectable, Inject, ConflictException, BadRequestException } from '@nestjs/common';
import { MEMBERSHIP_REPOSITORY_TOKEN } from '../domain/tokens';
import { MembershipRepositoryPort } from '../domain/membership-repository.port';
import { MembershipCreate } from '@comparte-tu-tiempo/contracts';
import { MembershipEntity } from '../domain/membership.entity';

export interface CreateMembershipRequest {
  data: MembershipCreate;
  userId: string;
}

export interface CreateMembershipResponse {
  membership: MembershipEntity;
}

@Injectable()
export class CreateMembershipUseCase {
  constructor(
    @Inject(MEMBERSHIP_REPOSITORY_TOKEN)
    private readonly membershipRepository: MembershipRepositoryPort,
  ) {}

  async execute(request: CreateMembershipRequest): Promise<CreateMembershipResponse> {
    const { data, userId } = request;

    if (data.userId !== userId) {
      throw new BadRequestException('No puedes crear memberships en nombre de otro usuario');
    }

    const existing = await this.membershipRepository.findByUserAndGroup(data.userId, data.groupId);
    if (existing) {
      throw new ConflictException('Ya eres miembro de este grupo');
    }

    const membership = await this.membershipRepository.create(data);
    return { membership };
  }
}


