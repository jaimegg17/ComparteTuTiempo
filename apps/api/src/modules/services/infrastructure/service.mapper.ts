import { Service as PrismaService } from '@prisma/client';
import { Service } from '../domain/service.entity';
import { Service as ServiceContract } from '@comparte-tu-tiempo/contracts';

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

    const contract: ServiceContract = {
      id: prismaService.id,
      title: prismaService.title,
      description: prismaService.description,
      duration: prismaService.duration,
      location: prismaService.location,
      category: mapCategory(prismaService.category) as any,
      type: mapType(prismaService.type) as any,
      status: mapStatus(prismaService.status) as any,
      price: prismaService.price,
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
      duration: service.duration,
      location: service.location,
      category: mapCategoryToPrisma(service.category) as any,
      type: mapTypeToPrisma(service.type) as any,
      status: mapStatusToPrisma(service.status) as any,
      price: service.price,
      userId: service.userId,
    };
  }
}
