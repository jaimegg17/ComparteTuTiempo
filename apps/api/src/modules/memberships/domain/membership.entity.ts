export class MembershipEntity {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly groupId: number,
    public readonly role: 'MEMBER' | 'MODERATOR' | 'ADMIN',
    public readonly status: 'ACTIVA' | 'PENDIENTE' | 'SUSPENDIDA',
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
      groupId: this.groupId,
      role: this.role,
      status: this.status,
      joinedAt: this.joinedAt,
    };
  }
}
