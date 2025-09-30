export class MessageEntity {
  constructor(
    public readonly id: number,
    public readonly content: string,
    public readonly senderId: string,
    public readonly receiverId: string,
    public readonly createdAt: Date,
  ) {}

  // Business logic methods
  isFromUser(userId: string): boolean {
    return this.senderId === userId;
  }

  isToUser(userId: string): boolean {
    return this.receiverId === userId;
  }

  isBetweenUsers(userId1: string, userId2: string): boolean {
    return (this.senderId === userId1 && this.receiverId === userId2) ||
           (this.senderId === userId2 && this.receiverId === userId1);
  }

  // Convert to contract format
  toContract() {
    return {
      id: this.id,
      content: this.content,
      senderId: this.senderId,
      receiverId: this.receiverId,
      createdAt: this.createdAt,
    };
  }
}
