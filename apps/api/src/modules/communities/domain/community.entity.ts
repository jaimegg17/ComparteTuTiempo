export class CommunityEntity {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description: string | null,
    public readonly isPrivate: boolean,
    public readonly creatorId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  // Business logic methods
  isCreatedBy(userId: string): boolean {
    return this.creatorId === userId;
  }

  isPublic(): boolean {
    return !this.isPrivate;
  }

  // Convert to contract format
  toContract() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      isPrivate: this.isPrivate,
      creatorId: this.creatorId,
      createdAt: this.createdAt instanceof Date ? this.createdAt.toISOString() : this.createdAt,
      updatedAt: this.updatedAt instanceof Date ? this.updatedAt.toISOString() : this.updatedAt,
    };
  }
}
