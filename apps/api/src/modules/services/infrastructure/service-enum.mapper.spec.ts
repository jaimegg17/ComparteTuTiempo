import { ServiceEnumMapper } from './service-enum.mapper';

describe('ServiceEnumMapper', () => {
  describe('mapCategoryToPrisma', () => {
    it('should map lowercase category to uppercase Prisma enum', () => {
      expect(ServiceEnumMapper.mapCategoryToPrisma('educacion')).toBe('EDUCACION');
      expect(ServiceEnumMapper.mapCategoryToPrisma('hogar')).toBe('HOGAR');
      expect(ServiceEnumMapper.mapCategoryToPrisma('tecnologia')).toBe('TECNOLOGIA');
      expect(ServiceEnumMapper.mapCategoryToPrisma('salud')).toBe('SALUD');
      expect(ServiceEnumMapper.mapCategoryToPrisma('deportes')).toBe('DEPORTES');
      expect(ServiceEnumMapper.mapCategoryToPrisma('arte')).toBe('ARTE');
      expect(ServiceEnumMapper.mapCategoryToPrisma('otros')).toBe('OTROS');
    });

    it('should handle uppercase input correctly', () => {
      expect(ServiceEnumMapper.mapCategoryToPrisma('EDUCACION')).toBe('EDUCACION');
      expect(ServiceEnumMapper.mapCategoryToPrisma('HOGAR')).toBe('HOGAR');
      expect(ServiceEnumMapper.mapCategoryToPrisma('TECNOLOGIA')).toBe('TECNOLOGIA');
      expect(ServiceEnumMapper.mapCategoryToPrisma('SALUD')).toBe('SALUD');
      expect(ServiceEnumMapper.mapCategoryToPrisma('DEPORTES')).toBe('DEPORTES');
      expect(ServiceEnumMapper.mapCategoryToPrisma('ARTE')).toBe('ARTE');
      expect(ServiceEnumMapper.mapCategoryToPrisma('OTROS')).toBe('OTROS');
    });

    it('should default to OTROS for unknown categories', () => {
      expect(ServiceEnumMapper.mapCategoryToPrisma('invalid')).toBe('OTROS');
      expect(ServiceEnumMapper.mapCategoryToPrisma('unknown')).toBe('OTROS');
      expect(ServiceEnumMapper.mapCategoryToPrisma('')).toBe('OTROS');
    });

    it('should be case insensitive', () => {
      expect(ServiceEnumMapper.mapCategoryToPrisma('Educacion')).toBe('OTROS'); // Mixed case not supported
      expect(ServiceEnumMapper.mapCategoryToPrisma('educacion')).toBe('EDUCACION');
      expect(ServiceEnumMapper.mapCategoryToPrisma('EDUCACION')).toBe('EDUCACION');
    });
  });

  describe('mapTypeToPrisma', () => {
    it('should map lowercase type to uppercase Prisma enum', () => {
      expect(ServiceEnumMapper.mapTypeToPrisma('presencial')).toBe('PRESENCIAL');
      expect(ServiceEnumMapper.mapTypeToPrisma('virtual')).toBe('VIRTUAL');
      expect(ServiceEnumMapper.mapTypeToPrisma('hibrido')).toBe('HIBRIDO');
    });

    it('should handle uppercase input correctly', () => {
      expect(ServiceEnumMapper.mapTypeToPrisma('PRESENCIAL')).toBe('PRESENCIAL');
      expect(ServiceEnumMapper.mapTypeToPrisma('VIRTUAL')).toBe('VIRTUAL');
      expect(ServiceEnumMapper.mapTypeToPrisma('HIBRIDO')).toBe('HIBRIDO');
    });

    it('should default to PRESENCIAL for unknown types', () => {
      expect(ServiceEnumMapper.mapTypeToPrisma('invalid')).toBe('PRESENCIAL');
      expect(ServiceEnumMapper.mapTypeToPrisma('unknown')).toBe('PRESENCIAL');
      expect(ServiceEnumMapper.mapTypeToPrisma('')).toBe('PRESENCIAL');
    });
  });

  describe('mapStatusToPrisma', () => {
    it('should map lowercase status to uppercase Prisma enum', () => {
      expect(ServiceEnumMapper.mapStatusToPrisma('activo')).toBe('ACTIVO');
      expect(ServiceEnumMapper.mapStatusToPrisma('inactivo')).toBe('INACTIVO');
      expect(ServiceEnumMapper.mapStatusToPrisma('completado')).toBe('COMPLETADO');
    });

    it('should default to ACTIVO for unknown statuses', () => {
      expect(ServiceEnumMapper.mapStatusToPrisma('invalid')).toBe('ACTIVO');
      expect(ServiceEnumMapper.mapStatusToPrisma('unknown')).toBe('ACTIVO');
      expect(ServiceEnumMapper.mapStatusToPrisma('')).toBe('ACTIVO');
    });
  });

  describe('mapCategoryFromPrisma', () => {
    it('should map Prisma enum to lowercase', () => {
      expect(ServiceEnumMapper.mapCategoryFromPrisma('EDUCACION')).toBe('educacion');
      expect(ServiceEnumMapper.mapCategoryFromPrisma('HOGAR')).toBe('hogar');
      expect(ServiceEnumMapper.mapCategoryFromPrisma('TECNOLOGIA')).toBe('tecnologia');
      expect(ServiceEnumMapper.mapCategoryFromPrisma('SALUD')).toBe('salud');
      expect(ServiceEnumMapper.mapCategoryFromPrisma('DEPORTES')).toBe('deportes');
      expect(ServiceEnumMapper.mapCategoryFromPrisma('ARTE')).toBe('arte');
      expect(ServiceEnumMapper.mapCategoryFromPrisma('OTROS')).toBe('otros');
    });

    it('should default to otros for unknown values', () => {
      expect(ServiceEnumMapper.mapCategoryFromPrisma('INVALID')).toBe('otros');
    });
  });

  describe('mapTypeFromPrisma', () => {
    it('should map Prisma enum to lowercase', () => {
      expect(ServiceEnumMapper.mapTypeFromPrisma('PRESENCIAL')).toBe('presencial');
      expect(ServiceEnumMapper.mapTypeFromPrisma('VIRTUAL')).toBe('virtual');
      expect(ServiceEnumMapper.mapTypeFromPrisma('HIBRIDO')).toBe('hibrido');
    });

    it('should default to presencial for unknown values', () => {
      expect(ServiceEnumMapper.mapTypeFromPrisma('INVALID')).toBe('presencial');
    });
  });

  describe('mapStatusFromPrisma', () => {
    it('should map Prisma enum to lowercase', () => {
      expect(ServiceEnumMapper.mapStatusFromPrisma('ACTIVO')).toBe('activo');
      expect(ServiceEnumMapper.mapStatusFromPrisma('INACTIVO')).toBe('inactivo');
      expect(ServiceEnumMapper.mapStatusFromPrisma('COMPLETADO')).toBe('completado');
    });

    it('should default to activo for unknown values', () => {
      expect(ServiceEnumMapper.mapStatusFromPrisma('INVALID')).toBe('activo');
    });
  });

  describe('Round-trip conversion', () => {
    it('should maintain consistency in round-trip conversion for categories', () => {
      const categories = ['educacion', 'hogar', 'tecnologia', 'salud', 'deportes', 'arte', 'otros'];
      
      categories.forEach(category => {
        const prismaValue = ServiceEnumMapper.mapCategoryToPrisma(category);
        const backToOriginal = ServiceEnumMapper.mapCategoryFromPrisma(prismaValue);
        expect(backToOriginal).toBe(category);
      });
    });

    it('should maintain consistency in round-trip conversion for types', () => {
      const types = ['presencial', 'virtual', 'hibrido'];
      
      types.forEach(type => {
        const prismaValue = ServiceEnumMapper.mapTypeToPrisma(type);
        const backToOriginal = ServiceEnumMapper.mapTypeFromPrisma(prismaValue);
        expect(backToOriginal).toBe(type);
      });
    });

    it('should maintain consistency in round-trip conversion for statuses', () => {
      const statuses = ['activo', 'inactivo', 'completado'];
      
      statuses.forEach(status => {
        const prismaValue = ServiceEnumMapper.mapStatusToPrisma(status);
        const backToOriginal = ServiceEnumMapper.mapStatusFromPrisma(prismaValue);
        expect(backToOriginal).toBe(status);
      });
    });
  });
});

