import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ServiceRepositoryPort } from '../domain/service-repository.port';
import { Service } from '../domain/service.entity';
import { ServiceCreate, ServiceUpdate, ServiceListQuery, ServiceListResponse } from '@comparte-tu-tiempo/contracts';
import { ServiceMapper } from './service.mapper';
import { ServiceEnumMapper } from './service-enum.mapper';

@Injectable()
export class PrismaServiceRepository implements ServiceRepositoryPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: ServiceMapper,
  ) {}

  async create(data: ServiceCreate, userId: string): Promise<Service> {
    const prismaService = await this.prisma.service.create({
      data: {
        title: data.title,
        description: data.description,
        duration: data.duration,
        location: data.location,
        category: ServiceEnumMapper.mapCategoryToPrisma(data.category) as any,
        type: ServiceEnumMapper.mapTypeToPrisma(data.type) as any,
        price: data.price,
        userId,
        status: 'ACTIVO',
      },
    });

    return this.mapper.toDomain(prismaService);
  }

  async findById(id: number): Promise<Service | null> {
    const prismaService = await this.prisma.service.findUnique({
      where: { id },
    });

    return prismaService ? this.mapper.toDomain(prismaService) : null;
  }

  async findByUserId(userId: string): Promise<Service[]> {
    const prismaServices = await this.prisma.service.findMany({
      where: { userId },
    });

    return prismaServices.map(service => this.mapper.toDomain(service));
  }

  async list(query: ServiceListQuery): Promise<ServiceListResponse> {
    const { q, category, city, type, status, page, pageSize } = query;
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
    if (city) where.location = { contains: city, mode: 'insensitive' };

    // Obtener total y servicios
    const [total, prismaServices] = await Promise.all([
      this.prisma.service.count({ where }),
      this.prisma.service.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const services = prismaServices.map(service => this.mapper.toDomain(service));
    const totalPages = Math.ceil(total / pageSize);

    return {
      services: services.map(service => service.toContract()),
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
