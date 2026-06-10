export class GroupEntity {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description: string,
    public readonly communityId: number,
    public readonly creatorId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  // Business logic methods
  isCreatedBy(userId: string): boolean {
    return this.creatorId === userId;
  }

  // Convert to contract format
  toContract() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      communityId: this.communityId,
      creatorId: this.creatorId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
