import { Service as ServiceContract } from '@comparte-tu-tiempo/contracts';

export class Service {
  private readonly _id: number;
  private readonly _title: string;
  private readonly _description: string;
  private readonly _duration: number;
  private readonly _location: string | null;
  private readonly _category: ServiceContract['category'];
  private readonly _type: ServiceContract['type'];
  private readonly _status: ServiceContract['status'];
  private readonly _price: number;
  private readonly _userId: string;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(props: ServiceContract) {
    this._id = props.id;
    this._title = props.title;
    this._description = props.description;
    this._duration = props.duration;
    this._location = props.location;
    this._category = props.category;
    this._type = props.type;
    this._status = props.status;
    this._price = props.price;
    this._userId = props.userId;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  // Getters (inmutables)
  get id(): number { return this._id; }
  get title(): string { return this._title; }
  get description(): string { return this._description; }
  get duration(): number { return this._duration; }
  get location(): string | null { return this._location; }
  get category(): ServiceContract['category'] { return this._category; }
  get type(): ServiceContract['type'] { return this._type; }
  get status(): ServiceContract['status'] { return this._status; }
  get price(): number { return this._price; }
  get userId(): string { return this._userId; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // Métodos de dominio
  isActive(): boolean {
    return this._status === 'activo';
  }

  isOwnedBy(userId: string): boolean {
    return this._userId === userId;
  }

  canBeUpdatedBy(userId: string): boolean {
    return this.isOwnedBy(userId) && this.isActive();
  }

  canBeDeletedBy(userId: string): boolean {
    return this.isOwnedBy(userId);
  }

  // Métodos de utilidad
  get durationFormatted(): string {
    return `${this._duration} hora${this._duration !== 1 ? 's' : ''}`;
  }

  get hasLocation(): boolean {
    return !!this._location;
  }

  get isLocalService(): boolean {
    return this._type === 'presencial';
  }

  // Método para convertir a contrato
  toContract(): ServiceContract {
    return {
      id: this._id,
      title: this._title,
      description: this._description,
      duration: this._duration,
      location: this._location,
      category: this._category,
      type: this._type,
      status: this._status,
      price: this._price,
      userId: this._userId,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  // Factory method para crear desde contrato
  static fromContract(contract: ServiceContract): Service {
    return new Service(contract);
  }
}
