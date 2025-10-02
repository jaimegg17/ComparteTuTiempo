import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ServiceRepositoryPort } from '../domain/service-repository.port';
import { Service } from '../domain/service.entity';
import { ServiceCreate, ServiceUpdate, ServiceListQuery, ServiceListResponse } from '@comparte-tu-tiempo/contracts';
import { ServiceMapper } from './service.mapper';
import { ServiceEnumMapper } from './service-enum.mapper';
import { ServiceCreateWithImage } from '../domain/service.types';

@Injectable()
export class PrismaServiceRepository implements ServiceRepositoryPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: ServiceMapper,
  ) {}

  async create(data: ServiceCreateWithImage, userId: string): Promise<Service> {
    // Force include imageUrl in the data
    const serviceData = {
      title: data.title,
      description: data.description,
      duration: data.duration,
      location: data.location,
      category: ServiceEnumMapper.mapCategoryToPrisma(data.category) as any,
      type: ServiceEnumMapper.mapTypeToPrisma(data.type) as any,
      price: data.price,
      userId,
      status: 'ACTIVO' as const,
      detailedDescription: data.detailedDescription || null,
      availability: data.availability || null,
      imageUrl: data.imageUrl || null,
    };
    
    const prismaService = await this.prisma.service.create({
      data: serviceData,
    });

    return this.mapper.toDomain(prismaService);
  }

  async findById(id: number): Promise<any> {
    const prismaService = await this.prisma.service.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
            location: true,
            bio: true,
            skills: true,
            timeCredits: true,
            createdAt: true,
          }
        },
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10, // Limit to 10 most recent ratings
        },
        _count: {
          select: {
            ratings: true,
            exchanges: true,
          }
        }
      },
    });

    if (!prismaService) {
      return null;
    }

    // Return raw data with relations instead of mapping to domain entity
    return {
      ...prismaService,
      imageUrl: prismaService.imageUrl || null,
    };
  }

  async findByUserId(userId: string): Promise<Service[]> {
    const prismaServices = await this.prisma.service.findMany({
      where: { userId },
    });

    return prismaServices.map(service => this.mapper.toDomain(service));
  }

  async list(query: ServiceListQuery): Promise<ServiceListResponse> {
    const { q, category, location, type, status, page, pageSize } = query;
    const minPrice = (query as any).minPrice;
    const maxPrice = (query as any).maxPrice;
    const skip = (page - 1) * pageSize;

    // Construir filtros
    const where: any = {};
    
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }
    
    if (category) where.category = ServiceEnumMapper.mapCategoryToPrisma(category) as any;
    if (type) where.type = ServiceEnumMapper.mapTypeToPrisma(type) as any;
    if (status) where.status = ServiceEnumMapper.mapStatusToPrisma(status) as any;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    
    // Filtros de precio
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    // Obtener total y servicios con ratings
    const [total, prismaServices] = await Promise.all([
      this.prisma.service.count({ where }),
      this.prisma.service.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            }
          },
          ratings: {
            select: {
              score: true,
            }
          },
          _count: {
            select: {
              ratings: true,
              exchanges: true,
            }
          }
        },
      }),
    ]);

    // Calculate average rating for each service
    const servicesWithRatings = prismaServices.map(service => {
      const avgRating = service.ratings.length > 0
        ? service.ratings.reduce((sum, r) => sum + r.score, 0) / service.ratings.length
        : 0;


      return {
        ...service,
        averageRating: Number(avgRating.toFixed(1)),
        totalRatings: service._count.ratings, // Use _count instead of ratings.length
        totalExchanges: service._count.exchanges,
      };
    });

    const totalPages = Math.ceil(total / pageSize);

    return {
      services: servicesWithRatings.map(service => {
        const serviceData = service as any; // Temporary until Prisma types are updated
        return {
          id: service.id,
          title: service.title,
          description: service.description,
          detailedDescription: serviceData.detailedDescription || null,
          duration: service.duration,
          location: service.location,
          availability: serviceData.availability || null,
          category: service.category.toLowerCase() as any,
          type: service.type.toLowerCase() as any,
          status: service.status.toLowerCase() as any,
          price: service.price,
          imageUrl: serviceData.imageUrl || null,
          userId: service.userId,
          createdAt: service.createdAt,
          updatedAt: service.updatedAt,
          averageRating: service.averageRating,
          totalRatings: service.totalRatings,
          totalExchanges: service.totalExchanges,
          user: service.user,
        };
      }),
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async update(id: number, data: ServiceUpdate, userId: string): Promise<Service> {
    // Verificar que el servicio existe y pertenece al usuario
    const existingService = await this.findById(id);
    if (!existingService) {
      throw new Error('Service not found');
    }
    if (!existingService.isOwnedBy(userId)) {
      throw new Error('Unauthorized to update this service');
    }

    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.duration) updateData.duration = data.duration;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.category) updateData.category = ServiceEnumMapper.mapCategoryToPrisma(data.category) as any;
    if (data.type) updateData.type = ServiceEnumMapper.mapTypeToPrisma(data.type) as any;
    if (data.status) updateData.status = ServiceEnumMapper.mapStatusToPrisma(data.status) as any;
    if (data.price) updateData.price = data.price;
    if ((data as any).imageUrl !== undefined) updateData.imageUrl = (data as any).imageUrl as string;

    const prismaService = await this.prisma.service.update({
      where: { id },
      data: updateData,
    });

    return this.mapper.toDomain(prismaService);
  }

  async delete(id: number, userId: string): Promise<void> {
    // Verificar que el servicio existe y pertenece al usuario
    const existingService = await this.findById(id);
    if (!existingService) {
      throw new Error('Service not found');
    }
    if (!existingService.canBeDeletedBy(userId)) {
      throw new Error('Unauthorized to delete this service');
    }

    await this.prisma.service.delete({
      where: { id },
    });
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.prisma.service.count({
      where: { id: { equals: id } },
    });
    return count > 0;
  }
}
