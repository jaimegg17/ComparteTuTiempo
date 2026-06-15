"use client";

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import type { ServiceListQuery } from '@comparte-tu-tiempo/contracts';

interface ServiceFiltersProps {
  query: ServiceListQuery;
  onQueryChange: (query: ServiceListQuery) => void;
}

export function ServiceFilters({ query, onQueryChange }: ServiceFiltersProps) {
  type CategoryFilter = NonNullable<ServiceListQuery['category']>;
  type TypeFilter = NonNullable<ServiceListQuery['type']>;
  const [searchTerm, setSearchTerm] = useState(query.q || '');

  const categories: Array<{ value: CategoryFilter; label: string }> = [
    { value: 'EDUCACION', label: 'Educación' },
    { value: 'HOGAR', label: 'Hogar' },
    { value: 'TECNOLOGIA', label: 'Tecnología' },
    { value: 'SALUD', label: 'Salud' },
    { value: 'DEPORTES', label: 'Deportes' },
    { value: 'ARTE', label: 'Arte' },
    { value: 'OTROS', label: 'Otros' },
  ];

  const types: Array<{ value: TypeFilter; label: string }> = [
    { value: 'PRESENCIAL', label: 'Presencial' },
    { value: 'VIRTUAL', label: 'Virtual' },
    { value: 'HIBRIDO', label: 'Híbrido' },
  ];

  const handleSearch = () => {
    onQueryChange({ ...query, q: searchTerm, page: 1 });
  };

  const handleCategoryFilter = (category: CategoryFilter | null) => {
    onQueryChange({ 
      ...query, 
      category: category || undefined, 
      page: 1 
    });
  };

  const handleTypeFilter = (type: TypeFilter | null) => {
    onQueryChange({ 
      ...query, 
      type: type || undefined, 
      page: 1 
    });
  };

  const clearFilters = () => {
    onQueryChange({
      page: 1,
      pageSize: query.pageSize,
    });
    setSearchTerm('');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Filtros de Búsqueda
      </h2>
      
      {/* Search bar */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Buscar servicios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Button onClick={handleSearch} size="sm">
            Buscar
          </Button>
        </div>
      </div>

      {/* Category filters */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Categoría</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!query.category ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleCategoryFilter(null)}
          >
            Todas
          </Button>
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={query.category === category.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleCategoryFilter(category.value)}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Type filters */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Tipo de Servicio</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!query.type ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleTypeFilter(null)}
          >
            Todos
          </Button>
          {types.map((type) => (
            <Button
              key={type.value}
              variant={query.type === type.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleTypeFilter(type.value)}
            >
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Clear filters button */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-gray-500 hover:text-gray-700"
        >
          Limpiar Filtros
        </Button>
      </div>
    </div>
  );
}
