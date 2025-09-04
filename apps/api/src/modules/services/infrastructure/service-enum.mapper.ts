// Mapper to convert contract enum values to Prisma enum values
export class ServiceEnumMapper {
  static mapCategoryToPrisma(category: string): string {
    const mapping: Record<string, string> = {
      'educacion': 'EDUCACION',
      'hogar': 'HOGAR',
      'tecnologia': 'TECNOLOGIA',
      'salud': 'SALUD',
      'deportes': 'DEPORTES',
      'arte': 'ARTE',
      'otros': 'OTROS',
    };
    return mapping[category] || 'OTROS';
  }

  static mapTypeToPrisma(type: string): string {
    const mapping: Record<string, string> = {
      'presencial': 'PRESENCIAL',
      'virtual': 'VIRTUAL',
      'hibrido': 'HIBRIDO',
    };
    return mapping[type] || 'PRESENCIAL';
  }

  static mapStatusToPrisma(status: string): string {
    const mapping: Record<string, string> = {
      'activo': 'ACTIVO',
      'inactivo': 'INACTIVO',
      'completado': 'COMPLETADO',
    };
    return mapping[status] || 'ACTIVO';
  }

  static mapCategoryFromPrisma(category: string): string {
    const mapping: Record<string, string> = {
      'EDUCACION': 'educacion',
      'HOGAR': 'hogar',
      'TECNOLOGIA': 'tecnologia',
      'SALUD': 'salud',
      'DEPORTES': 'deportes',
      'ARTE': 'arte',
      'OTROS': 'otros',
    };
    return mapping[category] || 'otros';
  }

  static mapTypeFromPrisma(type: string): string {
    const mapping: Record<string, string> = {
      'PRESENCIAL': 'presencial',
      'VIRTUAL': 'virtual',
      'HIBRIDO': 'hibrido',
    };
    return mapping[type] || 'presencial';
  }

  static mapStatusFromPrisma(status: string): string {
    const mapping: Record<string, string> = {
      'ACTIVO': 'activo',
      'INACTIVO': 'inactivo',
      'COMPLETADO': 'completado',
    };
    return mapping[status] || 'activo';
  }
}
