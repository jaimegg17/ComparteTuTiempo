import { Injectable } from '@nestjs/common';
import { Prisma, ServiceCategory, ServiceStatus, ServiceType } from '@prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ServiceRepositoryPort } from '../domain/service-repository.port';
import { Service } from '../domain/service.entity';
import { ServiceUpdate, ServiceListQuery, ServiceListResponse } from '@comparte-tu-tiempo/contracts';
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
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      formattedAddress: data.formattedAddress ?? null,
      placeId: data.placeId ?? null,
      category: ServiceEnumMapper.mapCategoryToPrisma(data.category) as ServiceCategory,
      type: ServiceEnumMapper.mapTypeToPrisma(data.type) as ServiceType,
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

  async findById(id: number): Promise<Service | null> {
    const prismaService = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!prismaService) {
      return null;
    }

    return this.mapper.toDomain(prismaService);
  }

  async findByUserId(userId: string): Promise<Service[]> {
    const prismaServices = await this.prisma.service.findMany({
      where: { userId },
    });

    return prismaServices.map(service => this.mapper.toDomain(service));
  }

  async list(query: ServiceListQuery): Promise<ServiceListResponse> {
    const { q, category, location, type, status, page, pageSize, userId, nearLat, nearLng } = query;
    const minPrice = query.minPrice;
    const maxPrice = query.maxPrice;
    const radiusKm = query.radiusKm ?? 10;
    const skip = (page - 1) * pageSize;

    // Construir filtros
    const where: Prisma.ServiceWhereInput = {};
    
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }
    
    if (category) where.category = ServiceEnumMapper.mapCategoryToPrisma(category) as ServiceCategory;
    if (type) where.type = ServiceEnumMapper.mapTypeToPrisma(type) as ServiceType;
    if (status) where.status = ServiceEnumMapper.mapStatusToPrisma(status) as ServiceStatus;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (userId) where.userId = userId; // Filtrar por usuario
    if (nearLat !== undefined && nearLng !== undefined) {
      where.latitude = { not: null };
      where.longitude = { not: null };
    }
    
    // Filtros de precio
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    const prismaServices = await this.prisma.service.findMany({
      where,
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
    });

    // Calculate average rating for each service
    let servicesWithRatings = prismaServices.map(service => {
      const avgRating = service.ratings.length > 0
        ? service.ratings.reduce((sum, r) => sum + r.score, 0) / service.ratings.length
        : 0;

      const hasCoordinates = service.latitude !== null && service.longitude !== null;
      const distanceKm =
        nearLat !== undefined && nearLng !== undefined && hasCoordinates
          ? this.calculateDistanceKm(nearLat, nearLng, service.latitude as number, service.longitude as number)
          : null;

      return {
        ...service,
        averageRating: Number(avgRating.toFixed(1)),
        totalRatings: service._count.ratings, // Use _count instead of ratings.length
        totalExchanges: service._count.exchanges,
        distanceKm,
      };
    });

    if (nearLat !== undefined && nearLng !== undefined) {
      servicesWithRatings = servicesWithRatings
        .filter((service) => service.distanceKm !== null && (service.distanceKm as number) <= radiusKm)
        .sort((a, b) => (a.distanceKm as number) - (b.distanceKm as number));
    }

    const total = servicesWithRatings.length;
    const paginatedServices = servicesWithRatings.slice(skip, skip + pageSize);

    const totalPages = Math.ceil(total / pageSize);

    return {
      services: paginatedServices.map(service => {
        const serviceData = service as typeof service & {
          detailedDescription?: string | null;
          availability?: string | null;
          imageUrl?: string | null;
          formattedAddress?: string | null;
          placeId?: string | null;
          latitude?: number | null;
          longitude?: number | null;
        };
        return {
          id: service.id,
          title: service.title,
          description: service.description,
          detailedDescription: serviceData.detailedDescription || null,
          duration: service.duration,
          location: service.location,
          latitude: serviceData.latitude ?? null,
          longitude: serviceData.longitude ?? null,
          formattedAddress: serviceData.formattedAddress ?? null,
          placeId: serviceData.placeId ?? null,
          availability: serviceData.availability || null,
          category: service.category.toLowerCase() as unknown as ServiceListResponse['services'][number]['category'],
          type: service.type.toLowerCase() as unknown as ServiceListResponse['services'][number]['type'],
          status: service.status.toLowerCase() as unknown as ServiceListResponse['services'][number]['status'],
          price: service.price,
          imageUrl: serviceData.imageUrl || null,
          userId: service.userId,
          createdAt: service.createdAt,
          updatedAt: service.updatedAt,
          averageRating: service.averageRating,
          totalRatings: service.totalRatings,
          totalExchanges: service.totalExchanges,
          distanceKm: service.distanceKm,
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
    if (existingService.userId !== userId) {
      throw new Error('Unauthorized to update this service');
    }

    const updateData: Prisma.ServiceUncheckedUpdateInput = {};
    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.duration) updateData.duration = data.duration;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.formattedAddress !== undefined) updateData.formattedAddress = data.formattedAddress;
    if (data.placeId !== undefined) updateData.placeId = data.placeId;
    if (data.category) updateData.category = ServiceEnumMapper.mapCategoryToPrisma(data.category) as ServiceCategory;
    if (data.type) updateData.type = ServiceEnumMapper.mapTypeToPrisma(data.type) as ServiceType;
    if (data.status) updateData.status = ServiceEnumMapper.mapStatusToPrisma(data.status) as ServiceStatus;
    if (data.price) updateData.price = data.price;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

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
    if (existingService.userId !== userId) {
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

  private calculateDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((earthRadiusKm * c).toFixed(2));
  }
}
