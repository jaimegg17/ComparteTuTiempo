export class RatingEntity {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly serviceId: number,
    public readonly score: number,
    public readonly comment: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  // Business logic methods
  isFromUser(userId: string): boolean {
    return this.userId === userId;
  }

  isValidScore(): boolean {
    return this.score >= 1 && this.score <= 5;
  }

  hasComment(): boolean {
    return this.comment !== null && this.comment.trim().length > 0;
  }

  // Convert to contract format
  toContract() {
    return {
      id: this.id,
      userId: this.userId,
      serviceId: this.serviceId,
      score: this.score,
      comment: this.comment,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
