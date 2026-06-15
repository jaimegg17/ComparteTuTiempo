import { Service as ServiceContract } from '@comparte-tu-tiempo/contracts';
import { ServiceWithImage } from './service.types';

export class Service {
  private readonly _id: number;
  private readonly _title: string;
  private readonly _description: string;
  private readonly _detailedDescription: string | null | undefined;
  private readonly _duration: number;
  private readonly _location: string | null;
  private readonly _latitude: number | null | undefined;
  private readonly _longitude: number | null | undefined;
  private readonly _formattedAddress: string | null | undefined;
  private readonly _placeId: string | null | undefined;
  private readonly _availability: string | null | undefined;
  private readonly _category: ServiceContract['category'];
  private readonly _type: ServiceContract['type'];
  private readonly _intent: ServiceContract['intent'];
  private readonly _status: ServiceContract['status'];
  private readonly _price: number;
  private readonly _imageUrl: string | null | undefined;
  private readonly _communityId: number | null | undefined;
  private readonly _userId: string;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(props: ServiceWithImage) {
    this._id = props.id;
    this._title = props.title;
    this._description = props.description;
    this._detailedDescription = props.detailedDescription;
    this._duration = props.duration;
    this._location = props.location;
    this._latitude = props.latitude;
    this._longitude = props.longitude;
    this._formattedAddress = props.formattedAddress;
    this._placeId = props.placeId;
    this._availability = props.availability;
    this._category = props.category;
    this._type = props.type;
    this._intent = props.intent;
    this._status = props.status;
    this._price = props.price;
    this._imageUrl = props.imageUrl;
    this._communityId = props.communityId;
    this._userId = props.userId;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  // Getters (inmutables)
  get id(): number { return this._id; }
  get title(): string { return this._title; }
  get description(): string { return this._description; }
  get detailedDescription(): string | null | undefined { return this._detailedDescription; }
  get duration(): number { return this._duration; }
  get location(): string | null { return this._location; }
  get latitude(): number | null | undefined { return this._latitude; }
  get longitude(): number | null | undefined { return this._longitude; }
  get formattedAddress(): string | null | undefined { return this._formattedAddress; }
  get placeId(): string | null | undefined { return this._placeId; }
  get availability(): string | null | undefined { return this._availability; }
  get category(): ServiceContract['category'] { return this._category; }
  get type(): ServiceContract['type'] { return this._type; }
  get intent(): ServiceContract['intent'] { return this._intent; }
  get status(): ServiceContract['status'] { return this._status; }
  get price(): number { return this._price; }
  get imageUrl(): string | null | undefined { return this._imageUrl; }
  get communityId(): number | null | undefined { return this._communityId; }
  get userId(): string { return this._userId; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // Domain methods
  isActive(): boolean {
    return this._status === 'ACTIVO';
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

  // Utility methods
  get durationFormatted(): string {
    return `${this._duration} hora${this._duration !== 1 ? 's' : ''}`;
  }

  get hasLocation(): boolean {
    return !!this._location;
  }

  get isLocalService(): boolean {
    return this._type === 'PRESENCIAL';
  }

  // Convert to contract format
  toContract(): ServiceWithImage {
    return {
      id: this._id,
      title: this._title,
      description: this._description,
      detailedDescription: this._detailedDescription,
      duration: this._duration,
      location: this._location,
      latitude: this._latitude,
      longitude: this._longitude,
      formattedAddress: this._formattedAddress,
      placeId: this._placeId,
      availability: this._availability,
      category: this._category,
      type: this._type,
      intent: this._intent,
      status: this._status,
      price: this._price,
      imageUrl: this._imageUrl,
      communityId: this._communityId,
      userId: this._userId,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  // Factory method para crear desde contrato
  static fromContract(contract: ServiceWithImage): Service {
    return new Service(contract);
  }
}
