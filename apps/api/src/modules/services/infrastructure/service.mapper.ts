import { Service as PrismaService, ServiceCategory, ServiceStatus, ServiceType } from '@prisma/client';
import { Service } from '../domain/service.entity';
import { ServiceWithImage } from '../domain/service.types';

export class ServiceMapper {
  toDomain(prismaService: PrismaService): Service {
    // Mapear los enums de Prisma a los valores esperados por los contratos
    const mapCategory = (category: string) => {
      const mapping: Record<string, string> = {
        'EDUCACION': 'educacion',
        'HOGAR': 'hogar',
        'TECNOLOGIA': 'tecnologia',
        'SALUD': 'salud',
        'DEPORTES': 'deportes',
        'ARTE': 'arte',
        'OTROS': 'otros'
      };
      return mapping[category] || 'otros';
    };

    const mapType = (type: string) => {
      const mapping: Record<string, string> = {
        'PRESENCIAL': 'presencial',
        'VIRTUAL': 'virtual',
        'HIBRIDO': 'hibrido'
      };
      return mapping[type] || 'presencial';
    };

    const mapStatus = (status: string) => {
      const mapping: Record<string, string> = {
        'ACTIVO': 'activo',
        'INACTIVO': 'inactivo',
        'COMPLETADO': 'completado'
      };
      return mapping[status] || 'activo';
    };

    const contract: ServiceWithImage = {
      id: prismaService.id,
      title: prismaService.title,
      description: prismaService.description,
      detailedDescription: prismaService.detailedDescription,
      duration: prismaService.duration,
      location: prismaService.location,
      latitude: prismaService.latitude,
      longitude: prismaService.longitude,
      formattedAddress: prismaService.formattedAddress,
      placeId: prismaService.placeId,
      availability: prismaService.availability,
      category: mapCategory(prismaService.category) as unknown as ServiceWithImage['category'],
      type: mapType(prismaService.type) as unknown as ServiceWithImage['type'],
      status: mapStatus(prismaService.status) as unknown as ServiceWithImage['status'],
      price: prismaService.price,
      imageUrl: prismaService.imageUrl,
      userId: prismaService.userId,
      createdAt: prismaService.createdAt,
      updatedAt: prismaService.updatedAt,
    };

    return Service.fromContract(contract);
  }

  toPrisma(service: Service): Omit<PrismaService, 'id' | 'createdAt' | 'updatedAt'> {
    // Mapear los valores de los contratos a los enums de Prisma
    const mapCategoryToPrisma = (category: string) => {
      const mapping: Record<string, string> = {
        'educacion': 'EDUCACION',
        'hogar': 'HOGAR',
        'tecnologia': 'TECNOLOGIA',
        'salud': 'SALUD',
        'deportes': 'DEPORTES',
        'arte': 'ARTE',
        'otros': 'OTROS'
      };
      return mapping[category] || 'OTROS';
    };

    const mapTypeToPrisma = (type: string) => {
      const mapping: Record<string, string> = {
        'presencial': 'PRESENCIAL',
        'virtual': 'VIRTUAL',
        'hibrido': 'HIBRIDO'
      };
      return mapping[type] || 'PRESENCIAL';
    };

    const mapStatusToPrisma = (status: string) => {
      const mapping: Record<string, string> = {
        'activo': 'ACTIVO',
        'inactivo': 'INACTIVO',
        'completado': 'COMPLETADO'
      };
      return mapping[status] || 'ACTIVO';
    };

    return {
      title: service.title,
      description: service.description,
      detailedDescription: service.detailedDescription || null,
      duration: service.duration,
      location: service.location,
      latitude: service.latitude ?? null,
      longitude: service.longitude ?? null,
      formattedAddress: service.formattedAddress ?? null,
      placeId: service.placeId ?? null,
      availability: service.availability || null,
      category: mapCategoryToPrisma(service.category) as ServiceCategory,
      type: mapTypeToPrisma(service.type) as ServiceType,
      status: mapStatusToPrisma(service.status) as ServiceStatus,
      price: service.price,
      imageUrl: service.imageUrl || null,
      userId: service.userId,
    };
  }
}
