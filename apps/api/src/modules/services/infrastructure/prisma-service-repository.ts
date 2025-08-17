import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ServiceRepositoryPort } from '../domain/service-repository.port';
import { Service } from '../domain/service.entity';
import { ServiceCreate, ServiceUpdate, ServiceListQuery, ServiceListResponse } from '@comparte-tu-tiempo/contracts';
import { ServiceMapper } from './service.mapper';

@Injectable()
export class PrismaServiceRepository implements ServiceRepositoryPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: ServiceMapper,
  ) {}

  async create(data: ServiceCreate, userId: number): Promise<Service> {
    const prismaService = await this.prisma.service.create({
      data: {
        ...data,
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

  async findByUserId(userId: number): Promise<Service[]> {
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
    
    if (category) where.category = category;
    if (type) where.type = type;
    if (status) where.status = status;
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

  async update(id: number, data: ServiceUpdate, userId: number): Promise<Service> {
    // Verificar que el servicio existe y pertenece al usuario
    const existingService = await this.findById(id);
    if (!existingService) {
      throw new Error('Service not found');
    }
    if (!existingService.isOwnedBy(userId)) {
      throw new Error('Unauthorized to update this service');
    }

    const prismaService = await this.prisma.service.update({
      where: { id },
      data,
    });

    return this.mapper.toDomain(prismaService);
  }

  async delete(id: number, userId: number): Promise<void> {
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
      where: { id },
    });
    return count > 0;
  }
}
