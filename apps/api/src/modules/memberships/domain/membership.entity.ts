export class MembershipEntity {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly communityId: number,
    public readonly role: string,
    public readonly joinedAt: Date,
  ) {}

  // Business logic methods
  isUser(userId: string): boolean {
    return this.userId === userId;
  }

  isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  isModerator(): boolean {
    return this.role === 'MODERATOR';
  }

  isMember(): boolean {
    return this.role === 'MEMBER';
  }

  canManageCommunity(): boolean {
    return this.role === 'ADMIN' || this.role === 'MODERATOR';
  }

  // Convert to contract format
  toContract() {
    return {
      id: this.id,
      userId: this.userId,
      communityId: this.communityId,
      role: this.role,
      joinedAt: this.joinedAt,
    };
  }
}
