export class EventEntity {
  constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly description: string,
    public readonly date: Date,
    public readonly location: string | null,
    public readonly communityId: number,
    public readonly creatorId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  // Business logic methods
  isCreatedBy(userId: string): boolean {
    return this.creatorId === userId;
  }

  isUpcoming(): boolean {
    return this.date > new Date();
  }

  isPast(): boolean {
    return this.date < new Date();
  }

  // Convert to contract format
  toContract() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      date: this.date,
      location: this.location,
      communityId: this.communityId,
      creatorId: this.creatorId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
